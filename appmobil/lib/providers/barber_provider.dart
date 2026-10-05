import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:firebase_auth/firebase_auth.dart';

class BarberProvider with ChangeNotifier {
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  
  Map<String, dynamic>? _currentUser;
  final Map<String, List<Map<String, dynamic>>> _db = {
    'users': [],
    'clients': [],
    'services': [],
    'cuts': [],
    'turns': [],
  };

  Map<String, dynamic>? get currentUser => _currentUser;
  Map<String, List<Map<String, dynamic>>> get db => _db;

  StreamSubscription? _usersSub;
  StreamSubscription? _cutsSub;
  StreamSubscription? _servicesSub;
  StreamSubscription? _clientsSub;
  StreamSubscription? _turnsSub;

  bool _isLoading = false;
  String? _errorMessage;

  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  BarberProvider() {
    _loadSession();
  }

  void _loadSession() async {
    final prefs = await SharedPreferences.getInstance();
    final username = prefs.getString('saved_username');
    final password = prefs.getString('saved_password');
    final loginType = prefs.getString('login_type');

    if (loginType == 'google' && username != null) {
      // Re-autenticar sesión previa de Google
      _restoreGoogleUser(username);
    } else if (username != null && password != null) {
      login(username, password, saveSession: false);
    }
  }

  Future<void> _restoreGoogleUser(String email) async {
    _isLoading = true;
    notifyListeners();
    try {
      final snap = await _firestore.collection('users')
          .where('username', isEqualTo: email.toLowerCase().trim())
          .limit(1)
          .get();

      if (snap.docs.isNotEmpty) {
        final doc = snap.docs.first;
        _currentUser = Map<String, dynamic>.from(doc.data());
        _currentUser!['docId'] = doc.id;
        _currentUser!['id'] = (_currentUser!['id'] ?? _currentUser!['ID'] ?? doc.id).toString();
        _startListeners();
      }
    } catch (_) {
      // Sesión expirada o sin internet
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void login(String username, String password, {bool saveSession = true}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    final cleanUser = username.trim();
    final cleanPass = password.trim();

    try {
      // 1. Consulta directa con username limpio
      var snapshot = await _firestore.collection('users')
          .where('username', isEqualTo: cleanUser)
          .where('password', isEqualTo: cleanPass)
          .get();

      // 2. Si no encuentra, intentar con espacio al final
      if (snapshot.docs.isEmpty) {
        snapshot = await _firestore.collection('users')
            .where('username', isEqualTo: '$cleanUser ')
            .where('password', isEqualTo: cleanPass)
            .get();
      }

      QueryDocumentSnapshot<Map<String, dynamic>>? matchedDoc;
      if (snapshot.docs.isNotEmpty) {
        matchedDoc = snapshot.docs.first;
      } else {
        // 3. Fallback: buscar ignorando mayúsculas y espacios accidentales
        final allUsers = await _firestore.collection('users').get();
        for (final doc in allUsers.docs) {
          final data = doc.data();
          final uName = (data['username'] ?? '').toString().trim().toLowerCase();
          final uPass = (data['password'] ?? '').toString().trim();
          if (uName == cleanUser.toLowerCase() && uPass == cleanPass) {
            matchedDoc = doc;
            break;
          }
        }
      }

      if (matchedDoc != null) {
        final data = matchedDoc.data();
        _currentUser = Map<String, dynamic>.from(data);
        _currentUser!['docId'] = matchedDoc.id;
        _currentUser!['id'] = (data['id'] ?? data['ID'] ?? matchedDoc.id).toString();
        
        if (saveSession) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('saved_username', cleanUser);
          await prefs.setString('saved_password', cleanPass);
          await prefs.setString('login_type', 'credentials');
        }
        
        _startListeners();
      } else {
        _errorMessage = 'Credenciales incorrectas';
      }
    } catch (e) {
      _errorMessage = 'Error de conexión: $e';
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> loginWithGoogle() async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final GoogleSignIn googleSignIn = GoogleSignIn();
      final GoogleSignInAccount? googleUser = await googleSignIn.signIn();
      if (googleUser == null) {
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final AuthCredential credential = GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      await FirebaseAuth.instance.signInWithCredential(credential);

      final email = googleUser.email.toLowerCase().trim();
      
      var snapshot = await _firestore.collection('users')
          .where('username', isEqualTo: email)
          .limit(1)
          .get();

      Map<String, dynamic> userData;
      String docId;

      if (snapshot.docs.isNotEmpty) {
        final doc = snapshot.docs.first;
        docId = doc.id;
        userData = Map<String, dynamic>.from(doc.data());
      } else {
        // Fallback por campo email si existiese
        var emailSnap = await _firestore.collection('users')
            .where('email', isEqualTo: email)
            .limit(1)
            .get();

        if (emailSnap.docs.isNotEmpty) {
          final doc = emailSnap.docs.first;
          docId = doc.id;
          userData = Map<String, dynamic>.from(doc.data());
        } else {
          // Registrar nuevo usuario como cliente automáticamente
          docId = DateTime.now().millisecondsSinceEpoch.toString();
          userData = {
            'id': docId,
            'name': googleUser.displayName ?? 'Cliente Google',
            'username': email,
            'email': email,
            'role': 'cliente',
            'photoURL': googleUser.photoUrl ?? '',
            'ci': 'GOOGLE_USER',
            'phone': '',
            'createdAt': FieldValue.serverTimestamp(),
          };

          await _firestore.collection('users').doc(docId).set(userData);
          await _firestore.collection('clients').doc(docId).set({
            ...userData,
            'totalCuts': 0,
            'cutsForFree': 0,
          });
        }
      }

      _currentUser = userData;
      _currentUser!['docId'] = docId;
      _currentUser!['id'] = (userData['id'] ?? userData['ID'] ?? docId).toString();

      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('saved_username', email);
      await prefs.setString('login_type', 'google');

      _startListeners();
      return true;
    } catch (e) {
      _errorMessage = 'Error al iniciar con Google: $e';
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void logout() async {
    _currentUser = null;
    _usersSub?.cancel();
    _cutsSub?.cancel();
    _servicesSub?.cancel();
    _clientsSub?.cancel();
    _turnsSub?.cancel();
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('saved_username');
    await prefs.remove('saved_password');
    await prefs.remove('login_type');
    
    try {
      await GoogleSignIn().signOut();
      await FirebaseAuth.instance.signOut();
    } catch (_) {}

    notifyListeners();
  }

  Future<bool> changePassword(String newPassword) async {
    if (_currentUser == null) return false;
    try {
      final docId = _currentUser!['docId'];
      await _firestore.collection('users').doc(docId).update({'password': newPassword});
      
      final prefs = await SharedPreferences.getInstance();
      if (prefs.containsKey('saved_password')) {
        await prefs.setString('saved_password', newPassword);
      }
      
      _currentUser!['password'] = newPassword;
      notifyListeners();
      return true;
    } catch (e) {
      return false;
    }
  }

  void _startListeners() {
    _usersSub?.cancel();
    _cutsSub?.cancel();
    _servicesSub?.cancel();
    _clientsSub?.cancel();
    _turnsSub?.cancel();

    _usersSub = _firestore.collection('users').snapshots().listen((snap) {
      _db['users'] = snap.docs.map((doc) => <String, dynamic>{...doc.data(), 'id': doc.id}).toList();
      
      if (_currentUser != null) {
        final myDocId = _currentUser!['docId'];
        final updatedUser = _db['users']?.firstWhere(
          (u) => u['id'] == myDocId,
          orElse: () => {},
        );
        
        if (updatedUser != null && updatedUser.isNotEmpty) {
          _currentUser = {...updatedUser, 'docId': myDocId};
        }
      }

      notifyListeners();
    });

    _servicesSub = _firestore.collection('services').snapshots().listen((snap) {
      final list = snap.docs.map((doc) => <String, dynamic>{...doc.data(), 'id': doc.id}).toList();
      list.sort((a, b) {
        final priceA = double.tryParse(a['price'].toString()) ?? 0.0;
        final priceB = double.tryParse(b['price'].toString()) ?? 0.0;
        return priceB.compareTo(priceA);
      });
      _db['services'] = list;
      notifyListeners();
    });

    _clientsSub = _firestore.collection('clients').snapshots().listen((snap) {
      _db['clients'] = snap.docs.map((doc) => <String, dynamic>{...doc.data(), 'id': doc.id}).toList();
      notifyListeners();
    });

    // Subscripción a Turnos / Reservas
    _turnsSub = _firestore.collection('turns').snapshots().listen((snap) {
      final turns = snap.docs.map((doc) {
        final data = Map<String, dynamic>.from(doc.data());
        data['id'] = doc.id;
        return data;
      }).toList();

      turns.sort((a, b) => (b['scheduledTime'] ?? '').toString().compareTo((a['scheduledTime'] ?? '').toString()));
      _db['turns'] = turns;
      notifyListeners();
    });

    _cutsSub = _firestore.collection('cuts').snapshots().listen(
      (snap) {
        final allCuts = snap.docs.map((doc) {
          final data = Map<String, dynamic>.from(doc.data());
          data['id'] = doc.id;
          
          if (data['date'] != null) {
            DateTime? dateValue;
            if (data['date'] is Timestamp) {
              dateValue = (data['date'] as Timestamp).toDate();
            } else if (data['date'] is String) {
              dateValue = DateTime.tryParse(data['date']);
            }

            if (dateValue != null) {
              final boliviaTime = dateValue.toUtc().subtract(const Duration(hours: 4));
              data['date'] = boliviaTime.toIso8601String().replaceAll('Z', '');
            }
          }
          return data;
        }).toList();

        final role = (_currentUser?['role'] ?? _currentUser?['rol'] ?? '').toString().toLowerCase();
        
        if (role == 'barbero' || role == 'barber') {
          final myId = _currentUser?['id']?.toString();
          final myDocId = _currentUser?['docId']?.toString();
          final myName = _currentUser?['name']?.toString().toLowerCase().trim();

          var filtered = allCuts.where((cut) {
            final cId = (cut['barberId'] ?? cut['idBarbero'] ?? cut['barberoId'] ?? '').toString();
            final cName = (cut['barberName'] ?? cut['nombreBarbero'] ?? '').toString().toLowerCase().trim();
            return (myId != null && cId == myId) || 
                   (myDocId != null && cId == myDocId) || 
                   (myName != null && cName == myName && myName.isNotEmpty);
          }).toList();

          if (filtered.isEmpty && allCuts.isNotEmpty) {
            _db['cuts'] = allCuts;
            _errorMessage = "Dato: Se hallaron ${allCuts.length} cortes totales en DB, pero ninguno coincide con tu ID ($myId) o Nombre ($myName).";
          } else {
            _db['cuts'] = filtered;
            _errorMessage = null;
          }
        } else {
          // Administrador o Cliente: almacena todos los cortes
          _db['cuts'] = allCuts;
          _errorMessage = null;
        }
        
        notifyListeners();
      },
      onError: (e) {
        _errorMessage = "Error de red: $e";
        notifyListeners();
      }
    );
  }

  bool _isRecordingCut = false;
  Future<bool> recordCut(Map<String, dynamic> cutData) async {
    if (_isRecordingCut) return false;
    _isRecordingCut = true;
    try {
      await _firestore.collection('cuts').add({
        ...cutData,
        'date': FieldValue.serverTimestamp(),
        'barberId': _currentUser?['id'],
        'barberName': _currentUser?['name'],
        'idBarbero': _currentUser?['id'],
      });
      return true;
    } catch (e) {
      return false;
    } finally {
      _isRecordingCut = false;
    }
  }

  // Agendar turno / cita de cliente
  Future<bool> addTurn({
    required String serviceId,
    required String serviceName,
    required double servicePrice,
    required String barberId,
    required String barberName,
    required String date,
    required String time,
    required String clientName,
    required String clientPhone,
  }) async {
    try {
      final turnId = DateTime.now().millisecondsSinceEpoch.toString();
      final newNumber = (_db['turns']?.length ?? 0) + 1;
      await _firestore.collection('turns').doc(turnId).set({
        'id': turnId,
        'number': newNumber,
        'serviceId': serviceId,
        'serviceName': serviceName,
        'price': servicePrice,
        'barberId': barberId,
        'barberName': barberName,
        'scheduledDate': date,
        'scheduledTime': '$date $time',
        'time': time,
        'clientId': _currentUser?['id'] ?? 'guest',
        'clientName': clientName,
        'clientPhone': clientPhone,
        'clientUsername': _currentUser?['username'] ?? '',
        'status': 'esperando',
        'createdAt': FieldValue.serverTimestamp(),
        'arrivalTime': DateTime.now().toIso8601String(),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Cambiar estado de turno (ej. 'confirmado', 'completado', 'cancelado')
  Future<bool> updateTurnStatus(String turnId, String newStatus) async {
    try {
      await _firestore.collection('turns').doc(turnId).update({
        'status': newStatus,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      return true;
    } catch (e) {
      return false;
    }
  }

  @override
  void dispose() {
    _usersSub?.cancel();
    _cutsSub?.cancel();
    _servicesSub?.cancel();
    _clientsSub?.cancel();
    _turnsSub?.cancel();
    super.dispose();
  }
}
