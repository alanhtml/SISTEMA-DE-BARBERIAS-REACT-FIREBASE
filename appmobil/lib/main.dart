import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:provider/provider.dart';
import 'providers/barber_provider.dart';
import 'package:intl/intl.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'screens/welcome_screen.dart';
import 'screens/admin_dashboard.dart';
import 'screens/client_screens.dart';

import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase init error: $e");
  }
  try {
    await initializeDateFormatting('es', null);
    await initializeDateFormatting('es_ES', null);
  } catch (e) {
    debugPrint("DateFormatting init error: $e");
  }
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => BarberProvider()),
      ],
      child: const UrbanBarberApp(),
    ),
  );
}

class UrbanBarberApp extends StatefulWidget {
  const UrbanBarberApp({super.key});

  @override
  State<UrbanBarberApp> createState() => _UrbanBarberAppState();
}

class _UrbanBarberAppState extends State<UrbanBarberApp> {
  bool _showLogin = false;

  @override
  Widget build(BuildContext context) {
    const luxuryGold = Color(0xFFc5a059);
    return MaterialApp(
      title: 'URBAN BARBER',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: luxuryGold,
        scaffoldBackgroundColor: const Color(0xFF000000),
        cardColor: const Color(0xFF0A0A0A),
        colorScheme: const ColorScheme.dark(
          primary: luxuryGold,
          secondary: Color(0xFF161616),
          surface: Color(0xFF0A0A0A),
          onSurface: Colors.white,
        ),
        textTheme: GoogleFonts.hankenGroteskTextTheme(ThemeData.dark().textTheme),
        useMaterial3: true,
      ),
      home: Consumer<BarberProvider>(
        builder: (context, provider, _) {
          // 1. Si no hay sesión activa:
          if (provider.currentUser == null) {
            if (_showLogin) {
              return LoginPage(onBackToWelcome: () => setState(() => _showLogin = false));
            }
            return WelcomeScreen(onContinueToLogin: () => setState(() => _showLogin = true));
          }

          // 2. DETECCIÓN DE ROL:
          final role = (provider.currentUser?['role'] ?? provider.currentUser?['rol'] ?? '').toString().toLowerCase().trim();

          if (role == 'admin') {
            return const AdminNavigation();
          } else if (role == 'cliente') {
            return const ClientNavigation();
          } else {
            return const MainNavigation(); // Barbero
          }
        },
      ),
    );
  }
}

class LoginPage extends StatefulWidget {
  final VoidCallback? onBackToWelcome;
  const LoginPage({super.key, this.onBackToWelcome});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _userController = TextEditingController();
  final _passController = TextEditingController();
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();

    return Scaffold(
      backgroundColor: Colors.black,
      resizeToAvoidBottomInset: true,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topLeft,
            radius: 1.5,
            colors: [luxuryGold.withValues(alpha: 0.15), Colors.black],
          )
        ),
        child: SafeArea(
          child: Stack(
            children: [
              if (widget.onBackToWelcome != null)
                Positioned(
                  top: 10,
                  left: 15,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white70, size: 20),
                    onPressed: widget.onBackToWelcome,
                  ),
                ),
              Center(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  padding: const EdgeInsets.symmetric(horizontal: 40.0, vertical: 20.0),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 130,
                          height: 130,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white.withValues(alpha: 0.1), width: 2),
                            boxShadow: [
                              BoxShadow(color: luxuryGold.withValues(alpha: 0.2), blurRadius: 30, spreadRadius: 5)
                            ]
                          ),
                          child: ClipOval(
                            child: Transform.scale(
                              scale: 1.15,
                              child: Image.asset('assets/logo.png', fit: BoxFit.cover),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Center(
                        child: Column(
                          children: [
                            Text('URBAN BARBER', 
                              style: GoogleFonts.anton(fontSize: 28, color: Colors.white, letterSpacing: 5)
                            ),
                            const Text('SISTEMA DE GESTIÓN ELITE', 
                              style: TextStyle(letterSpacing: 4, fontWeight: FontWeight.bold, fontSize: 9, color: Colors.white38)
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 40),
                      TextField(
                        controller: _userController,
                        autocorrect: false,
                        enableSuggestions: false,
                        textCapitalization: TextCapitalization.none,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          hintText: 'USUARIO O CORREO',
                          prefixIcon: const Icon(Icons.person_outline, color: luxuryGold, size: 22),
                          filled: true,
                          fillColor: Colors.white.withValues(alpha: 0.05),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(vertical: 20),
                        ),
                      ),
                      const SizedBox(height: 15),
                      TextField(
                        controller: _passController,
                        obscureText: true,
                        autocorrect: false,
                        enableSuggestions: false,
                        textCapitalization: TextCapitalization.none,
                        style: const TextStyle(fontWeight: FontWeight.bold),
                        decoration: InputDecoration(
                          hintText: 'CONTRASEÑA',
                          prefixIcon: const Icon(Icons.lock_outline, color: luxuryGold, size: 22),
                          filled: true,
                          fillColor: Colors.white.withValues(alpha: 0.05),
                          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                          contentPadding: const EdgeInsets.symmetric(vertical: 20),
                        ),
                      ),
                      const SizedBox(height: 30),
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: ElevatedButton(
                          onPressed: provider.isLoading 
                            ? null 
                            : () {
                              provider.login(
                                _userController.text.trim(), 
                                _passController.text.trim(),
                              );
                            },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: luxuryGold,
                            foregroundColor: Colors.black,
                            elevation: 15,
                            shadowColor: luxuryGold.withValues(alpha: 0.4),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: provider.isLoading
                            ? const CircularProgressIndicator(color: Colors.black)
                            : const Text('ACCEDER AL PANEL', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 13)),
                        ),
                      ),
                      const SizedBox(height: 14),

                      // INICIO CON GOOGLE
                      SizedBox(
                        width: double.infinity,
                        height: 60,
                        child: OutlinedButton(
                          onPressed: provider.isLoading
                              ? null
                              : () async {
                                  final messenger = ScaffoldMessenger.of(context);
                                  final ok = await provider.loginWithGoogle();
                                  if (!ok && provider.errorMessage != null) {
                                    messenger.showSnackBar(
                                      SnackBar(
                                        backgroundColor: const Color(0xFF250808),
                                        content: Text(provider.errorMessage!, style: const TextStyle(color: Colors.redAccent)),
                                      ),
                                    );
                                  }
                                },
                          style: OutlinedButton.styleFrom(
                            backgroundColor: const Color(0xFF101010),
                            side: BorderSide(color: Colors.white.withValues(alpha: 0.1)),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.network(
                                'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                                width: 18,
                                height: 18,
                                errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata_rounded, color: Colors.white, size: 24),
                              ),
                              const SizedBox(width: 10),
                              const Text(
                                'CONTINUAR CON GOOGLE',
                                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ),

                      if (provider.errorMessage != null)
                        Padding(
                          padding: const EdgeInsets.only(top: 20),
                          child: Center(
                            child: Text(
                              provider.errorMessage!.toUpperCase(),
                              textAlign: TextAlign.center,
                              style: const TextStyle(color: luxuryGold, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 1),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  int _selectedIndex = 0;
  static const Color luxuryGold = Color(0xFFc5a059);

  final List<Widget> _pages = [
    const BarberDashboard(),
    const QuickCutPage(),
    const BarberReports(),
    const BarberProfile(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _pages[_selectedIndex],
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05), width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) => setState(() => _selectedIndex = index),
          backgroundColor: const Color(0xFF000000),
          indicatorColor: luxuryGold.withValues(alpha: 0.15),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          height: 70,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.grid_view_rounded, size: 22),
              selectedIcon: Icon(Icons.grid_view_rounded, color: luxuryGold, size: 26),
              label: 'Dashboard',
            ),
            NavigationDestination(
              icon: Icon(Icons.content_cut_rounded, size: 22),
              selectedIcon: Icon(Icons.content_cut_rounded, color: luxuryGold, size: 26),
              label: 'Corte',
            ),
            NavigationDestination(
              icon: Icon(Icons.leaderboard_rounded, size: 22),
              selectedIcon: Icon(Icons.leaderboard_rounded, color: luxuryGold, size: 26),
              label: 'Reportes',
            ),
            NavigationDestination(
              icon: Icon(Icons.person_rounded, size: 22),
              selectedIcon: Icon(Icons.person_rounded, color: luxuryGold, size: 26),
              label: 'Perfil',
            ),
          ],
        ),
      ),
    );
  }
}

// --- DASHBOARD VIEW ---
class BarberDashboard extends StatelessWidget {
  const BarberDashboard({super.key});

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final allCuts = provider.db['cuts'] ?? [];
    const luxuryGold = Color(0xFFc5a059);

    final boliviaNow = DateTime.now().toUtc().subtract(const Duration(hours: 4));
    final todayStr = DateFormat('yyyy-MM-dd').format(boliviaNow);
    final todayCuts = allCuts.where((c) => c['date'].toString().startsWith(todayStr)).toList();

    double totalGenerated = 0;
    double commission = 0;
    
    Map<String, List<Map<String, dynamic>>> cutsByDate = {};
    for (var cut in todayCuts) {
      String dateKey = cut['date'].toString().split('T')[0];
      cutsByDate.putIfAbsent(dateKey, () => []).add(cut);
      totalGenerated += double.tryParse(cut['price'].toString()) ?? 0;
    }

    cutsByDate.forEach((date, dayCuts) {
      dayCuts.sort((a, b) => a['date'].toString().compareTo(b['date'].toString()));
      for (int i = 0; i < dayCuts.length; i++) {
        double price = double.tryParse(dayCuts[i]['price'].toString()) ?? 0;
        if (i == 0) {
          commission += price;
        } else {
          commission += price * 0.5;
        }
      }
    });

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 10, height: 10,
                    decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle),
                  ),
                  const SizedBox(width: 8),
                  Text('SISTEMA ACTIVO', style: GoogleFonts.montserrat(fontWeight: FontWeight.w900, fontSize: 9, letterSpacing: 2, color: Colors.white38)),
                ],
              ),
              IconButton(
                onPressed: () => context.read<BarberProvider>().logout(),
                icon: const Icon(Icons.logout_rounded, size: 22, color: luxuryGold),
              ),
            ],
          ),
          const SizedBox(height: 25),
          
          Text('PANEL DE', 
            style: GoogleFonts.anton(fontSize: 46, color: Colors.white, height: 0.9, letterSpacing: 1)
          ),
          Text('CONTROL', 
            style: GoogleFonts.anton(fontSize: 46, color: luxuryGold, height: 0.9, letterSpacing: 1)
          ),
          const SizedBox(height: 5),
          Text(DateFormat('EEEE, d MMMM', 'es').format(boliviaNow).toUpperCase(),
            style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 2)
          ),
          
          const SizedBox(height: 35),

          if (provider.errorMessage != null)
            Container(
              padding: const EdgeInsets.all(15),
              margin: const EdgeInsets.only(bottom: 25),
              decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12), border: Border.all(color: luxuryGold.withValues(alpha: 0.2))),
              child: Text(provider.errorMessage!, style: const TextStyle(color: luxuryGold, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 15,
            crossAxisSpacing: 15,
            childAspectRatio: 1.4,
            children: [
              _buildStatCard('MI COMISIÓN', 'Bs. ${commission.toStringAsFixed(0)}', Colors.white, true),
              _buildStatCard('TOTAL DÍA', 'Bs. ${totalGenerated.toStringAsFixed(0)}', luxuryGold, false),
              _buildStatCard('SERVICIOS', '${todayCuts.length}', Colors.white38, false),
              _buildStatCard('PENDIENTE', 'Bs. ${(totalGenerated - commission).toStringAsFixed(0)}', Colors.white38, false),
            ],
          ),
          
          const SizedBox(height: 40),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('ACTIVIDAD RECIENTE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, letterSpacing: 2, color: luxuryGold)),
              const Icon(Icons.bolt, size: 16, color: luxuryGold),
            ],
          ),
          const SizedBox(height: 20),
          
          ...todayCuts.map((cut) {
            return _buildActivityItem(
              cut['serviceName'] ?? 'Servicio',
              cut['clientName'] ?? 'Visitante',
              cut['date'].toString().contains('T') 
                ? DateFormat('HH:mm').format(DateTime.parse(cut['date']))
                : '00:00',
              'Bs. ${cut['price']}'
            );
          }),
          if (todayCuts.isEmpty) 
            Center(child: Padding(
              padding: const EdgeInsets.all(60),
              child: Column(
                children: [
                  Icon(Icons.content_cut_rounded, size: 40, color: Colors.white.withValues(alpha: 0.03)),
                  const SizedBox(height: 15),
                  const Text('SIN REGISTROS HOY', style: TextStyle(color: Colors.white12, fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2)),
                ],
              ),
            )),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, Color color, bool featured) {
    const luxuryGold = Color(0xFFc5a059);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: featured ? const Color(0xFF0F0F0F) : const Color(0xFF070707),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: featured ? luxuryGold.withValues(alpha: 0.3) : Colors.white.withValues(alpha: 0.05)),
        boxShadow: featured ? [BoxShadow(color: luxuryGold.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))] : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: featured ? luxuryGold : Colors.white38, letterSpacing: 1.5)),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: GoogleFonts.anton(fontSize: 28, color: color, letterSpacing: 1)),
          ),
        ],
      ),
    );
  }

  Widget _buildActivityItem(String service, String client, String time, String price) {
    const luxuryGold = Color(0xFFc5a059);
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 18),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.03)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(10)),
            child: const Icon(Icons.content_cut_rounded, size: 18, color: luxuryGold),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(service.toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                const SizedBox(height: 2),
                Text('$time • $client', style: const TextStyle(fontSize: 9, color: Colors.white24, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          Text(price, style: GoogleFonts.anton(color: Colors.white, fontSize: 16)),
        ],
      ),
    );
  }
}

// --- QUICK CUT VIEW ---
class QuickCutPage extends StatefulWidget {
  const QuickCutPage({super.key});

  @override
  State<QuickCutPage> createState() => _QuickCutPageState();
}

class _QuickCutPageState extends State<QuickCutPage> {
  String? _selectedServiceId;
  String? _selectedClientId = 'visitor';
  final _searchController = TextEditingController();
  bool _isSaving = false;
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final services = List<Map<String, dynamic>>.from(provider.db['services'] ?? [])
      ..sort((a, b) {
        final priceA = double.tryParse(a['price'].toString()) ?? 0.0;
        final priceB = double.tryParse(b['price'].toString()) ?? 0.0;
        return priceB.compareTo(priceA); // De mayor a menor
      });
    final clients = provider.db['clients'] ?? [];

    final filteredClients = _searchController.text.length > 1
        ? clients.where((c) =>
            c['name'].toString().toLowerCase().contains(_searchController.text.toLowerCase()) ||
            c['ci'].toString().contains(_searchController.text)).toList()
        : [];

    return SafeArea(
      child: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            physics: const BouncingScrollPhysics(),
            padding: const EdgeInsets.all(30.0),
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight - 60),
              child: IntrinsicHeight(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('NUEVO', style: GoogleFonts.anton(fontSize: 44, height: 0.9, letterSpacing: 1)),
                    Text('SERVICIO', style: GoogleFonts.anton(fontSize: 44, color: luxuryGold, height: 0.9, letterSpacing: 1)),
                    const SizedBox(height: 5),
                    const Text('REGISTRO INSTANTÁNEO DE CORTE', style: TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
                    
                    const SizedBox(height: 45),
                    
                    _buildInputLabel('1. SELECCIONAR SERVICIO'),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFF111111),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                      ),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          isExpanded: true,
                          value: _selectedServiceId,
                          hint: const Text('CATÁLOGO DE SERVICIOS...', style: TextStyle(fontSize: 12, color: Colors.white24, fontWeight: FontWeight.bold)),
                          dropdownColor: const Color(0xFF111111),
                          items: services.map((s) {
                            return DropdownMenuItem<String>(
                              value: s['id'].toString(),
                              child: Text('${s['name'].toString().toUpperCase()} - Bs. ${s['price']}', style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w900)),
                            );
                          }).toList(),
                          onChanged: (v) => setState(() => _selectedServiceId = v),
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: 30),
                    
                    _buildInputLabel('2. CLIENTE (OPCIONAL)'),
                    TextField(
                      controller: _searchController,
                      onChanged: (v) => setState(() {}),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        hintText: 'BUSCAR POR NOMBRE O CI...',
                        hintStyle: const TextStyle(fontSize: 12, color: Colors.white24, fontWeight: FontWeight.bold),
                        prefixIcon: const Icon(Icons.search_rounded, color: luxuryGold, size: 22),
                        filled: true,
                        fillColor: const Color(0xFF111111),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                        contentPadding: const EdgeInsets.symmetric(vertical: 18),
                      ),
                    ),
                    
                    if (filteredClients.isNotEmpty)
                      Container(
                        margin: const EdgeInsets.only(top: 10),
                        constraints: const BoxConstraints(maxHeight: 160),
                        decoration: BoxDecoration(
                          color: const Color(0xFF161616),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                        ),
                        child: ListView.separated(
                          shrinkWrap: true,
                          itemCount: filteredClients.length,
                          separatorBuilder: (context, index) => Divider(height: 1, color: Colors.white.withValues(alpha: 0.05)),
                          itemBuilder: (context, index) {
                            final c = filteredClients[index];
                            return ListTile(
                              title: Text(c['name'].toString().toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                              subtitle: Text('CI: ${c['ci'] ?? 'N/A'}', style: const TextStyle(fontSize: 10, color: Colors.white24)),
                              onTap: () {
                                setState(() {
                                  _selectedClientId = c['id'].toString();
                                  _searchController.text = c['name'];
                                });
                              },
                            );
                          },
                        ),
                      ),
                    
                    const Spacer(),
                    const SizedBox(height: 25),
                    
                    SizedBox(
                      width: double.infinity,
                      height: 70,
                      child: ElevatedButton(
                        onPressed: _isSaving ? null : () async {
                          if (_selectedServiceId == null) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                backgroundColor: const Color(0xFF1E1E1E),
                                behavior: SnackBarBehavior.floating,
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  side: BorderSide(color: luxuryGold.withValues(alpha: 0.3)),
                                ),
                                content: const Row(
                                  children: [
                                    Icon(Icons.warning_amber_rounded, color: luxuryGold),
                                    SizedBox(width: 12),
                                    Text(
                                      'SELECCIONA UN SERVICIO PRIMERO',
                                      style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12),
                                    ),
                                  ],
                                ),
                              ),
                            );
                            return;
                          }

                          if (_isSaving) return;

                          final service = services.firstWhere((s) => s['id'].toString() == _selectedServiceId);
                          final client = _selectedClientId == 'visitor' 
                            ? {'name': 'Visitante', 'id': 'visitor'}
                            : clients.firstWhere((c) => c['id'].toString() == _selectedClientId);

                          // Doble confirmación modal
                          final messenger = ScaffoldMessenger.of(context);
                          final confirmed = await showDialog<bool>(
                            context: context,
                            barrierDismissible: false,
                            builder: (dialogContext) {
                              return AlertDialog(
                                backgroundColor: const Color(0xFF111111),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                  side: BorderSide(color: luxuryGold.withValues(alpha: 0.3), width: 1.5),
                                ),
                                titlePadding: const EdgeInsets.fromLTRB(24, 24, 24, 10),
                                contentPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                                actionsPadding: const EdgeInsets.fromLTRB(16, 10, 16, 20),
                                title: Row(
                                  children: [
                                    Container(
                                      padding: const EdgeInsets.all(8),
                                      decoration: BoxDecoration(
                                        color: luxuryGold.withValues(alpha: 0.1),
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      child: const Icon(Icons.help_outline_rounded, color: luxuryGold, size: 24),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            'CONFIRMAR CORTE',
                                            style: GoogleFonts.anton(fontSize: 20, color: Colors.white, letterSpacing: 1),
                                          ),
                                          const Text(
                                            '¿DESEAS REGISTRAR ESTE SERVICIO?',
                                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.white38, letterSpacing: 1),
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                                content: Container(
                                  padding: const EdgeInsets.all(16),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF181818),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
                                  ),
                                  child: Column(
                                    mainAxisSize: MainAxisSize.min,
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('SERVICIO:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1)),
                                          Flexible(
                                            child: Text(
                                              service['name'].toString().toUpperCase(),
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 10),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('PRECIO:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1)),
                                          Text(
                                            'Bs. ${service['price']}',
                                            style: GoogleFonts.anton(fontSize: 18, color: luxuryGold, letterSpacing: 1),
                                          ),
                                        ],
                                      ),
                                      const Divider(color: Colors.white10, height: 20),
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          const Text('CLIENTE:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1)),
                                          Flexible(
                                            child: Text(
                                              client['name'].toString().toUpperCase(),
                                              style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white70),
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ],
                                  ),
                                ),
                                actions: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton(
                                          onPressed: () => Navigator.of(dialogContext).pop(false),
                                          style: OutlinedButton.styleFrom(
                                            foregroundColor: Colors.white60,
                                            side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                                            padding: const EdgeInsets.symmetric(vertical: 14),
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          child: const Text('CANCELAR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1)),
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: ElevatedButton(
                                          onPressed: () => Navigator.of(dialogContext).pop(true),
                                          style: ElevatedButton.styleFrom(
                                            backgroundColor: luxuryGold,
                                            foregroundColor: Colors.black,
                                            padding: const EdgeInsets.symmetric(vertical: 14),
                                            elevation: 5,
                                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                          ),
                                          child: const Text('SÍ, REGISTRAR', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w900, letterSpacing: 1)),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              );
                            },
                          );

                          if (confirmed != true) return;
                          if (!mounted) return;

                          // Bloqueo inmediato contra duplicación
                          if (_isSaving) return;
                          setState(() => _isSaving = true);
                          try {
                            final success = await provider.recordCut({
                              'serviceId': service['id'],
                              'serviceName': service['name'],
                              'price': service['price'],
                              'clientId': client['id'],
                              'clientName': client['name'],
                            });

                            if (!mounted) return;

                            if (success) {
                              messenger.showSnackBar(
                                SnackBar(
                                  backgroundColor: Colors.black,
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    side: const BorderSide(color: Colors.greenAccent, width: 1),
                                  ),
                                  content: Row(
                                    children: [
                                      const Icon(Icons.check_circle, color: Colors.greenAccent),
                                      const SizedBox(width: 15),
                                      Expanded(
                                        child: Text(
                                          '${service['name'].toString().toUpperCase()} REGISTRADO CON ÉXITO',
                                          style: const TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                              setState(() {
                                _selectedServiceId = null;
                                _selectedClientId = 'visitor';
                                _searchController.clear();
                              });
                            } else {
                              messenger.showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFF2A0808),
                                  behavior: SnackBarBehavior.floating,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    side: const BorderSide(color: Colors.redAccent, width: 1),
                                  ),
                                  content: const Row(
                                    children: [
                                      Icon(Icons.error_outline, color: Colors.redAccent),
                                      SizedBox(width: 15),
                                      Expanded(
                                        child: Text(
                                          'NO SE PUDO REGISTRAR EL SERVICIO. INTENTA DE NUEVO.',
                                          style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1, fontSize: 12),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              );
                            }
                          } finally {
                            if (mounted) {
                              setState(() => _isSaving = false);
                            }
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: _isSaving ? luxuryGold.withValues(alpha: 0.5) : luxuryGold,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
                          elevation: _isSaving ? 0 : 15,
                          shadowColor: luxuryGold.withValues(alpha: 0.4),
                        ),
                        child: _isSaving 
                          ? const Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                SizedBox(
                                  width: 22,
                                  height: 22,
                                  child: CircularProgressIndicator(color: Colors.black, strokeWidth: 2.5),
                                ),
                                SizedBox(width: 14),
                                Text(
                                  'REGISTRANDO...',
                                  style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 14),
                                ),
                              ],
                            )
                          : const Text(
                              'FINALIZAR Y REGISTRAR',
                              style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 14),
                            ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }

  Widget _buildInputLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 5),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
    );
  }
}

// --- REPORTS VIEW ---
class BarberReports extends StatefulWidget {
  const BarberReports({super.key});

  @override
  State<BarberReports> createState() => _BarberReportsState();
}

class _BarberReportsState extends State<BarberReports> {
  DateTime? _startDate;
  DateTime? _endDate;
  String? _selectedDateKey; 
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  void initState() {
    super.initState();
    final now = DateTime.now().toUtc().subtract(const Duration(hours: 4));
    _startDate = DateTime(now.year, now.month, now.day);
    _endDate = now;
    _selectedDateKey = DateFormat('yyyy-MM-dd').format(now);
  }

  void _setQuickRange(String range) {
    final now = DateTime.now().toUtc().subtract(const Duration(hours: 4));
    setState(() {
      if (range == 'hoy') {
        _startDate = DateTime(now.year, now.month, now.day);
        _endDate = now;
        _selectedDateKey = DateFormat('yyyy-MM-dd').format(now);
      } else if (range == 'semana') {
        _startDate = now.subtract(Duration(days: now.weekday - 1));
        _endDate = now;
        _selectedDateKey = null;
      } else if (range == 'mes') {
        _startDate = DateTime(now.year, now.month, 1);
        _endDate = now;
        _selectedDateKey = null;
      }
    });
  }

  Future<void> _selectDateRange(BuildContext context) async {
    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      initialDateRange: DateTimeRange(start: _startDate!, end: _endDate!),
      firstDate: DateTime(2023),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: luxuryGold,
              onPrimary: Colors.black,
              surface: Color(0xFF111111),
              onSurface: Colors.white,
            ),
            dialogTheme: const DialogThemeData(backgroundColor: Color(0xFF000000)),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        _startDate = picked.start;
        _endDate = picked.end;
        _selectedDateKey = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final allCuts = provider.db['cuts'] ?? [];
    
    final filteredCuts = allCuts.where((cut) {
      if (cut['date'] == null) return false;
      final dateStr = cut['date'].toString().split('T')[0];
      final cutDate = DateTime.tryParse(dateStr);
      if (cutDate == null) return false;
      final start = DateTime(_startDate!.year, _startDate!.month, _startDate!.day);
      final end = DateTime(_endDate!.year, _endDate!.month, _endDate!.day);
      return (cutDate.isAtSameMomentAs(start) || cutDate.isAfter(start)) &&
             (cutDate.isAtSameMomentAs(end) || cutDate.isBefore(end));
    }).toList();

    Map<String, List<Map<String, dynamic>>> cutsByDate = {};
    double totalGenerated = 0;
    double commission = 0;

    for (var cut in filteredCuts) {
      String date = cut['date'].toString().split('T')[0];
      cutsByDate.putIfAbsent(date, () => []).add(cut);
      totalGenerated += double.tryParse(cut['price'].toString()) ?? 0;
    }

    cutsByDate.forEach((date, dayCuts) {
      dayCuts.sort((a, b) => a['date'].toString().compareTo(b['date'].toString()));
      for (int i = 0; i < dayCuts.length; i++) {
        double price = double.tryParse(dayCuts[i]['price'].toString()) ?? 0;
        if (i == 0) {
          commission += price;
        } else {
          commission += price * 0.5;
        }
      }
    });

    final sortedDates = cutsByDate.keys.toList()..sort((a, b) => b.compareTo(a));

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          _buildHeader(provider, cutsByDate),
          const SizedBox(height: 25),
          _buildQuickFilters(),
          const SizedBox(height: 30),
          
          if (_selectedDateKey == null) ...[
            _buildSummaryCard(commission, totalGenerated),
            const SizedBox(height: 40),
            _buildSectionTitle('DESGLOSE POR DÍA'),
            const SizedBox(height: 15),
            if (sortedDates.isEmpty) _buildEmptyState(),
            ...sortedDates.map((dateKey) {
              final dayCuts = cutsByDate[dateKey]!;
              double dayTotal = dayCuts.fold(0, (prev, element) => prev + (double.tryParse(element['price'].toString()) ?? 0));
              double dayComm = 0;
              dayCuts.sort((a, b) => a['date'].toString().compareTo(b['date'].toString()));
              for (int i = 0; i < dayCuts.length; i++) {
                double p = double.tryParse(dayCuts[i]['price'].toString()) ?? 0;
                if (i == 0) {
                  dayComm += p;
                } else {
                  dayComm += p * 0.5;
                }
              }
              return GestureDetector(
                onTap: () => setState(() => _selectedDateKey = dateKey),
                child: _buildDayItem(dateKey, dayCuts.length, dayTotal, dayComm)
              );
            }),
          ] else ...[
            _buildDetailedHistoryView(cutsByDate[_selectedDateKey!] ?? []),
          ],
        ],
      ),
    );
  }

  Widget _buildHeader(BarberProvider provider, Map<String, List<Map<String, dynamic>>> cutsByDate) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('MIS', style: GoogleFonts.anton(fontSize: 40, height: 0.9, letterSpacing: 1)),
            Text('CUENTAS', style: GoogleFonts.anton(fontSize: 40, color: luxuryGold, height: 0.9, letterSpacing: 1)),
            Text(_selectedDateKey == null ? 'ANÁLISIS DE RENDIMIENTO' : 'DETALLE DEL DÍA', 
              style: const TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          ],
        ),
        if (_selectedDateKey != null)
          Row(
            children: [
              IconButton(
                onPressed: () => _exportCutsToPdf(provider, cutsByDate[_selectedDateKey!]!),
                icon: const Icon(Icons.picture_as_pdf_rounded, color: Colors.white70, size: 24),
              ),
              IconButton(
                onPressed: () => setState(() => _selectedDateKey = null),
                icon: const Icon(Icons.close_rounded, color: luxuryGold, size: 26),
              ),
            ],
          )
        else
          IconButton(
            onPressed: () => _selectDateRange(context),
            icon: const Icon(Icons.tune_rounded, color: luxuryGold, size: 26),
          )
      ],
    );
  }

  Widget _buildQuickFilters() {
    return Row(
      children: [
        _quickFilterBtn('HOY', () => _setQuickRange('hoy')),
        const SizedBox(width: 8),
        _quickFilterBtn('SEMANA', () => _setQuickRange('semana')),
        const SizedBox(width: 8),
        _quickFilterBtn('MES', () => _setQuickRange('mes')),
        const Spacer(),
        GestureDetector(
          onTap: () => _selectDateRange(context),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.05), borderRadius: BorderRadius.circular(8)),
            child: Text(
              '${DateFormat('dd/MM').format(_startDate!)} - ${DateFormat('dd/MM').format(_endDate!)}',
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white38),
            ),
          ),
        ),
      ],
    );
  }

  Widget _quickFilterBtn(String label, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 15, vertical: 10),
        decoration: BoxDecoration(
          color: luxuryGold.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: luxuryGold.withValues(alpha: 0.15))
        ),
        child: Text(label, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: luxuryGold, letterSpacing: 1)),
      ),
    );
  }

  Widget _buildSummaryCard(double commission, double total) {
    return Container(
      padding: const EdgeInsets.all(30),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [const Color(0xFF111111), const Color(0xFF050505)]
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.5), blurRadius: 30)],
      ),
      child: Column(
        children: [
          const Text('BALANCE ESTIMADO', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 2)),
          const SizedBox(height: 12),
          Text('Bs. ${commission.toStringAsFixed(2)}', style: GoogleFonts.anton(fontSize: 42, color: Colors.white, letterSpacing: 1)),
          const SizedBox(height: 25),
          const Divider(height: 1, color: Colors.white10),
          const SizedBox(height: 25),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMiniStat('TOTAL BRUTO', 'Bs. ${total.toStringAsFixed(0)}'),
              _buildMiniStat('PARA TIENDA', 'Bs. ${(total - commission).toStringAsFixed(0)}'),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildDetailedHistoryView(List<Map<String, dynamic>> cuts) {
    cuts.sort((a, b) => b['date'].toString().compareTo(a['date'].toString()));
    
    double dayTotal = 0;
    double dayComm = 0;
    final sortedByTime = List<Map<String, dynamic>>.from(cuts)..sort((a, b) => a['date'].toString().compareTo(b['date'].toString()));
    for (int i = 0; i < sortedByTime.length; i++) {
      double p = double.tryParse(sortedByTime[i]['price'].toString()) ?? 0;
      dayTotal += p;
      if (i == 0) {
        dayComm += p;
      } else {
        dayComm += p * 0.5;
      }
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(25),
          decoration: BoxDecoration(
            color: const Color(0xFF0A0A0A), 
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05))
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildMiniStat('CORTES', cuts.length.toString()),
              _buildMiniStat('TOTAL', 'Bs. ${dayTotal.toStringAsFixed(0)}'),
              _buildMiniStat('MI PARTE', 'Bs. ${dayComm.toStringAsFixed(1)}'),
            ],
          ),
        ),
        const SizedBox(height: 35),
        _buildSectionTitle('LISTADO DE SERVICIOS'),
        const SizedBox(height: 20),
        ...cuts.map((cut) => Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF070707),
            borderRadius: BorderRadius.circular(15),
            border: Border.all(color: Colors.white.withValues(alpha: 0.03))
          ),
          child: Row(
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(DateFormat('hh:mm a').format(DateTime.parse(cut['date'])), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900, color: Colors.white70)),
                  Text(cut['clientName']?.toString().toUpperCase() ?? 'VISITANTE', style: const TextStyle(fontSize: 9, color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
                ],
              ),
              const Spacer(),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(cut['serviceName'].toString().toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.5)),
                  Text('Bs. ${cut['price']}', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: luxuryGold)),
                ],
              )
            ],
          ),
        )),
      ],
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: luxuryGold, letterSpacing: 2.5));
  }

  Widget _buildMiniStat(String label, String value) {
    return Column(
      children: [
        Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 1)),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.anton(fontSize: 18, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 1)),
      ],
    );
  }

  Widget _buildEmptyState() {
    return const Center(child: Padding(
      padding: EdgeInsets.all(50),
      child: Text('SIN MOVIMIENTOS REGISTRADOS', textAlign: TextAlign.center, style: TextStyle(color: Colors.white12, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 2)),
    ));
  }


  Widget _buildDayItem(String date, int count, double total, double commission) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.symmetric(horizontal: 22, vertical: 22),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(DateFormat('EEEE, d MMM', 'es').format(DateTime.parse(date)).toUpperCase(), 
                style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, letterSpacing: 0.5)),
              const SizedBox(height: 4),
              Text('$count SERVICIOS • TOTAL Bs. ${total.toStringAsFixed(0)}', 
                style: const TextStyle(color: Colors.white24, fontSize: 9, fontWeight: FontWeight.w900, letterSpacing: 0.5)),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text('Bs. ${commission.toStringAsFixed(1)}',
                style: GoogleFonts.anton(fontWeight: FontWeight.w900, color: Colors.greenAccent, fontSize: 18, letterSpacing: 0.5)),
              const Text('MI PARTE', style: TextStyle(fontSize: 7, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 1)),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _exportCutsToPdf(BarberProvider provider, List<Map<String, dynamic>> cuts) async {
    final pdf = pw.Document();
    final user = provider.currentUser;
    final String barberName = user?['name'] ?? 'Barbero';

    final sortedCuts = List<Map<String, dynamic>>.from(cuts);
    sortedCuts.sort((a, b) => b['date'].toString().compareTo(a['date'].toString()));

    pdf.addPage(
      pw.MultiPage(
        pageFormat: PdfPageFormat.a4,
        build: (pw.Context context) {
          return [
            pw.Header(
              level: 0,
              child: pw.Row(
                mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
                children: [
                  pw.Text('URBAN BARBER - REPORTE DE RENDIMIENTO', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 16)),
                  pw.Text(DateFormat('dd/MM/yyyy').format(DateTime.now())),
                ],
              ),
            ),
            pw.SizedBox(height: 10),
            pw.Text('BARBERO: ${barberName.toUpperCase()}', style: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 12)),
            pw.Text('PERIODO: ${DateFormat('dd/MM/yy').format(_startDate!)} - ${DateFormat('dd/MM/yy').format(_endDate!)}', style: pw.TextStyle(fontSize: 10)),
            pw.SizedBox(height: 20),
            pw.TableHelper.fromTextArray(
              headers: ['Fecha', 'Servicio', 'Cliente', 'Precio (Bs.)'],
              data: sortedCuts.map((cut) {
                final dateStr = cut['date'].toString().contains('T') 
                  ? DateFormat('dd/MM/yy HH:mm').format(DateTime.parse(cut['date']))
                  : cut['date'];
                return [
                  dateStr,
                  cut['serviceName']?.toString().toUpperCase() ?? 'N/A',
                  cut['clientName']?.toString().toUpperCase() ?? 'VISITANTE',
                  cut['price']?.toString() ?? '0',
                ];
              }).toList(),
              headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, fontSize: 10),
              cellStyle: const pw.TextStyle(fontSize: 9),
              cellAlignment: pw.Alignment.centerLeft,
            ),
          ];
        },
      ),
    );

    await Printing.layoutPdf(
      onLayout: (PdfPageFormat format) async => pdf.save(),
      name: 'Reporte_${barberName.replaceAll(' ', '_')}_${DateFormat('yyyyMMdd').format(DateTime.now())}.pdf',
    );
  }
}

// --- PROFILE & SETTINGS VIEW ---
class BarberProfile extends StatefulWidget {
  const BarberProfile({super.key});

  @override
  State<BarberProfile> createState() => _BarberProfileState();
}

class _BarberProfileState extends State<BarberProfile> {
  final _passController = TextEditingController();
  bool _isUpdating = false;
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final user = provider.currentUser;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          Text('MI', style: GoogleFonts.anton(fontSize: 40, height: 0.9, letterSpacing: 1)),
          Text('PERFIL', style: GoogleFonts.anton(fontSize: 40, color: luxuryGold, height: 0.9, letterSpacing: 1)),
          const Text('GESTIÓN DE CUENTA Y SEGURIDAD', style: TextStyle(fontSize: 10, color: Colors.white38, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          
          const SizedBox(height: 45),
          
          Center(
            child: Stack(
              children: [
                CircleAvatar(
                  radius: 55,
                  backgroundColor: luxuryGold.withValues(alpha: 0.1),
                  child: const Icon(Icons.person_rounded, size: 60, color: luxuryGold),
                ),
                Positioned(
                  bottom: 0,
                  right: 0,
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(color: Colors.greenAccent, shape: BoxShape.circle),
                    child: const Icon(Icons.verified_user_rounded, size: 16, color: Colors.black),
                  ),
                )
              ],
            ),
          ),
          
          const SizedBox(height: 40),
          
          _buildInfoTile('NOMBRE COMPLETO', (user?['name'] ?? 'NO DISPONIBLE').toString().toUpperCase()),
          _buildInfoTile('CÉDULA DE IDENTIDAD', (user?['ci'] ?? user?['CI'] ?? 'NO REGISTRADO').toString()),
          _buildInfoTile('ID DE USUARIO', (user?['username'] ?? 'NO DISPONIBLE').toString().toUpperCase()),
          _buildInfoTile('RANGO / ROL', (user?['role'] ?? user?['rol'] ?? 'BARBERO ELITE').toString().toUpperCase()),

          const SizedBox(height: 40),
          const Text('SEGURIDAD', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: luxuryGold, letterSpacing: 2.5)),
          const SizedBox(height: 20),
          
          TextField(
            controller: _passController,
            obscureText: true,
            style: const TextStyle(fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'CAMBIAR CONTRASEÑA...',
              hintStyle: const TextStyle(fontSize: 12, color: Colors.white24, fontWeight: FontWeight.bold),
              filled: true,
              fillColor: const Color(0xFF111111),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
              suffixIcon: IconButton(
                icon: Icon(_isUpdating ? Icons.hourglass_empty_rounded : Icons.save_rounded, color: luxuryGold),
                onPressed: _isUpdating ? null : () async {
                  if (_passController.text.length < 4) {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('La contraseña es demasiado corta')));
                    return;
                  }
                  final messenger = ScaffoldMessenger.of(context);
                  setState(() => _isUpdating = true);
                  final success = await provider.changePassword(_passController.text);
                  if (!mounted) return;
                  setState(() => _isUpdating = false);
                  if (success) {
                    _passController.clear();
                    messenger.showSnackBar(const SnackBar(backgroundColor: Colors.green, content: Text('CONTRASEÑA ACTUALIZADA')));
                  }
                },
              ),
            ),
          ),
          
          const SizedBox(height: 60),
          
          SizedBox(
            width: double.infinity,
            height: 65,
            child: OutlinedButton.icon(
              onPressed: () => provider.logout(),
              icon: const Icon(Icons.power_settings_new_rounded),
              label: const Text('CERRAR SESIÓN DEL SISTEMA', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 13)),
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.white54,
                side: const BorderSide(color: Colors.white10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildInfoTile(String label, String value) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: const Color(0xFF0A0A0A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(fontSize: 8, color: Colors.white24, fontWeight: FontWeight.w900, letterSpacing: 1.5)),
          const SizedBox(height: 6),
          Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w900, color: Colors.white, letterSpacing: 0.5)),
        ],
      ),
    );
  }
}
