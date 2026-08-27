import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'dart:async';
import 'package:shared_preferences/shared_preferences.dart';

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
    if (username != null && password != null) {
      login(username, password, saveSession: false);
    }
  }

  void login(String username, String password, {bool saveSession = true}) async {
    _isLoading = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final snapshot = await _firestore.collection('users')
          .where('username', isEqualTo: username)
          .where('password', isEqualTo: password)
          .get();

      if (snapshot.docs.isNotEmpty) {
        final data = snapshot.docs.first.data();
        _currentUser = data;
        _currentUser!['docId'] = snapshot.docs.first.id;
        _currentUser!['id'] = (data['id'] ?? data['ID'] ?? snapshot.docs.first.id).toString();
        
        if (saveSession) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setString('saved_username', username);
          await prefs.setString('saved_password', password);
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

  void logout() async {
    _currentUser = null;
    _usersSub?.cancel();
    _cutsSub?.cancel();
    _servicesSub?.cancel();
    _clientsSub?.cancel();
    
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('saved_username');
    await prefs.remove('saved_password');
    
    notifyListeners();
  }

  Future<bool> changePassword(String newPassword) async {
    if (_currentUser == null) return false;
    try {
      final docId = _currentUser!['docId'];
      await _firestore.collection('users').doc(docId).update({'password': newPassword});
      
      // Actualizar en SharedPreferences si estaba guardado
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

    _usersSub = _firestore.collection('users').snapshots().listen((snap) {
      _db['users'] = snap.docs.map((doc) => <String, dynamic>{...doc.data(), 'id': doc.id}).toList();
      
      // Sincronizar _currentUser si sus datos cambiaron en Firestore
      if (_currentUser != null) {
        final myDocId = _currentUser!['docId'];
        final updatedUser = _db['users']?.firstWhere(
          (u) => u['id'] == myDocId,
          orElse: () => {},
        );
        
        if (updatedUser != null && updatedUser.isNotEmpty) {
          // Preservar el docId que usamos localmente
          _currentUser = {...updatedUser, 'docId': myDocId};
        }
      }

      notifyListeners();
    });

    _servicesSub = _firestore.collection('services').snapshots().listen((snap) {
      _db['services'] = snap.docs.map((doc) => <String, dynamic>{...doc.data(), 'id': doc.id}).toList();
      notifyListeners();
    });

    _clientsSub = _firestore.collection('clients').snapshots().listen((snap) {
      _db['clients'] = snap.docs.map((doc) => <String, dynamic>{...doc.data(), 'id': doc.id}).toList();
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
              // 1. Convertimos a UTC puro para tener base cero
              // 2. Restamos 4 horas (Bolivia)
              // 3. Convertimos a String y ELIMINAMOS la 'Z' para que el UI no la convierta de nuevo
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
            // Filtro flexible por ID (varios campos) o por Nombre exacto
            return (myId != null && cId == myId) || 
                   (myDocId != null && cId == myDocId) || 
                   (myName != null && cName == myName && myName.isNotEmpty);
          }).toList();

          // DEBUG: Si hay cortes en DB pero ninguno coincide con este barbero
          if (filtered.isEmpty && allCuts.isNotEmpty) {
            _db['cuts'] = allCuts; // Mostrar todos temporalmente para diagnóstico
            _errorMessage = "Dato: Se hallaron ${allCuts.length} cortes totales en DB, pero ninguno coincide con tu ID ($myId) o Nombre ($myName).";
          } else {
            _db['cuts'] = filtered;
            _errorMessage = null;
          }
        } else {
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

  Future<bool> recordCut(Map<String, dynamic> cutData) async {
    try {
      await _firestore.collection('cuts').add({
        ...cutData,
        'date': FieldValue.serverTimestamp(), // Hora oficial del servidor
        'barberId': _currentUser?['id'],
        'barberName': _currentUser?['name'],
        'idBarbero': _currentUser?['id'],
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
    super.dispose();
  }
}
