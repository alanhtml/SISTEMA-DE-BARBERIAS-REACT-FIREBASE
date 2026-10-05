import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/barber_provider.dart';

class AdminNavigation extends StatefulWidget {
  const AdminNavigation({super.key});

  @override
  State<AdminNavigation> createState() => _AdminNavigationState();
}

class _AdminNavigationState extends State<AdminNavigation> {
  int _currentSection = 0;
  static const Color luxuryGold = Color(0xFFc5a059);

  final List<String> _sectionTitles = [
    'DASHBOARD GENERAL',
    'STAFF DE BARBEROS',
    'TURNOS & RESERVAS',
    'REGISTRAR CORTE',
    'SERVICIOS & PRECIOS',
    'CLIENTES REGISTRADOS',
    'MI PERFIL ADMIN',
  ];

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final user = provider.currentUser;

    final List<Widget> sections = [
      const AdminDashboardView(),
      const AdminBarbersView(),
      const AdminTurnsView(),
      const AdminQuickCutView(),
      const AdminServicesView(),
      const AdminClientsView(),
      const AdminProfileView(),
    ];

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFF070707),
        elevation: 0,
        leading: Builder(
          builder: (ctx) => IconButton(
            icon: const Icon(Icons.menu_rounded, color: luxuryGold, size: 28),
            onPressed: () => Scaffold.of(ctx).openDrawer(),
          ),
        ),
        title: Text(
          _sectionTitles[_currentSection],
          style: GoogleFonts.anton(
            color: Colors.white,
            fontSize: 18,
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded, color: Colors.white38, size: 22),
            onPressed: () => provider.logout(),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(color: Colors.white.withValues(alpha: 0.05), height: 1),
        ),
      ),
      drawer: Drawer(
        backgroundColor: const Color(0xFF0B0B0B),
        child: SafeArea(
          child: Column(
            children: [
              // HEADER DEL DRAWER CON DATOS DEL ADMIN
              Container(
                padding: const EdgeInsets.fromLTRB(20, 25, 20, 20),
                decoration: BoxDecoration(
                  border: Border(bottom: BorderSide(color: Colors.white.withValues(alpha: 0.06), width: 1)),
                  gradient: RadialGradient(
                    center: Alignment.topLeft,
                    radius: 1.8,
                    colors: [
                      luxuryGold.withValues(alpha: 0.12),
                      const Color(0xFF0B0B0B),
                    ],
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 55,
                      height: 55,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: luxuryGold, width: 1.5),
                        boxShadow: [
                          BoxShadow(color: luxuryGold.withValues(alpha: 0.3), blurRadius: 15),
                        ],
                      ),
                      child: ClipOval(
                        child: Image.asset('assets/logo.png', fit: BoxFit.cover),
                      ),
                    ),
                    const SizedBox(width: 15),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            (user?['name'] ?? 'Administrador').toString().toUpperCase(),
                            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.white),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 2),
                          Text(
                            user?['username'] ?? '',
                            style: const TextStyle(fontSize: 10, color: Colors.white38),
                            overflow: TextOverflow.ellipsis,
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: luxuryGold.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: const Text(
                              'ADMIN GENERAL',
                              style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: luxuryGold, letterSpacing: 1),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // LISTA DE SECCIONES CON MENÚ HAMBURGUESA
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 10),
                  children: [
                    _buildCategoryLabel('OPERACIONES EN VIVO'),
                    _buildDrawerItem(0, Icons.dashboard_rounded, 'Dashboard Global'),
                    _buildDrawerItem(1, Icons.badge_rounded, 'Staff de Barberos'),
                    _buildDrawerItem(2, Icons.calendar_month_rounded, 'Turnos & Reservas'),
                    _buildDrawerItem(3, Icons.content_cut_rounded, 'Registrar Corte Express'),

                    const SizedBox(height: 15),
                    _buildCategoryLabel('GESTIÓN DEL SALÓN'),
                    _buildDrawerItem(4, Icons.category_rounded, 'Servicios & Tarifas'),
                    _buildDrawerItem(5, Icons.groups_rounded, 'Clientes Registrados'),

                    const SizedBox(height: 15),
                    _buildCategoryLabel('SISTEMA'),
                    _buildDrawerItem(6, Icons.manage_accounts_rounded, 'Mi Perfil & Ajustes'),
                  ],
                ),
              ),

              // BOTÓN CERRAR SESIÓN EN EL PIE DEL MENÚ
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border(top: BorderSide(color: Colors.white.withValues(alpha: 0.05))),
                ),
                child: ListTile(
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  tileColor: const Color(0xFF1E0A0A),
                  leading: const Icon(Icons.logout_rounded, color: Colors.redAccent, size: 20),
                  title: const Text(
                    'CERRAR SESIÓN',
                    style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1),
                  ),
                  onTap: () {
                    Navigator.of(context).pop();
                    provider.logout();
                  },
                ),
              ),
            ],
          ),
        ),
      ),
      body: sections[_currentSection],
    );
  }

  Widget _buildCategoryLabel(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 14, top: 10, bottom: 6),
      child: Text(
        title,
        style: const TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.white24, letterSpacing: 1.5),
      ),
    );
  }

  Widget _buildDrawerItem(int index, IconData icon, String title) {
    final isSelected = _currentSection == index;
    return Container(
      margin: const EdgeInsets.only(bottom: 4),
      decoration: BoxDecoration(
        color: isSelected ? luxuryGold.withValues(alpha: 0.12) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: isSelected ? luxuryGold.withValues(alpha: 0.4) : Colors.transparent),
      ),
      child: ListTile(
        dense: true,
        leading: Icon(icon, color: isSelected ? luxuryGold : Colors.white60, size: 20),
        title: Text(
          title,
          style: TextStyle(
            fontWeight: isSelected ? FontWeight.w900 : FontWeight.bold,
            color: isSelected ? Colors.white : Colors.white70,
            fontSize: 12,
            letterSpacing: 0.5,
          ),
        ),
        trailing: isSelected ? const Icon(Icons.chevron_right_rounded, color: luxuryGold, size: 18) : null,
        onTap: () {
          setState(() => _currentSection = index);
          Navigator.of(context).pop(); // Cierra el Drawer
        },
      ),
    );
  }
}

// =========================================================================
// 1. DASHBOARD GENERAL ADMINISTRADOR
// =========================================================================
class AdminDashboardView extends StatelessWidget {
  const AdminDashboardView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final allCuts = provider.db['cuts'] ?? [];
    final allUsers = provider.db['users'] ?? [];
    final barbers = allUsers.where((u) => (u['role'] ?? u['rol'] ?? '').toString().toLowerCase() == 'barbero').toList();

    final boliviaNow = DateTime.now().toUtc().subtract(const Duration(hours: 4));
    final todayStr = DateFormat('yyyy-MM-dd').format(boliviaNow);
    final todayCuts = allCuts.where((c) => c['date'].toString().startsWith(todayStr)).toList();

    double totalRecaudado = 0;
    double totalComisionesBarberos = 0;

    for (var barber in barbers) {
      final bId = barber['id']?.toString();
      final bDocId = barber['docId']?.toString();
      final bName = (barber['name'] ?? '').toString().toLowerCase().trim();

      final bCuts = todayCuts.where((cut) {
        final cId = (cut['barberId'] ?? cut['idBarbero'] ?? cut['barberoId'] ?? '').toString();
        final cName = (cut['barberName'] ?? cut['nombreBarbero'] ?? '').toString().toLowerCase().trim();
        return (bId != null && cId == bId) || 
               (bDocId != null && cId == bDocId) || 
               (bName.isNotEmpty && cName == bName);
      }).toList();

      bCuts.sort((a, b) => a['date'].toString().compareTo(b['date'].toString()));

      for (int i = 0; i < bCuts.length; i++) {
        double price = double.tryParse(bCuts[i]['price'].toString()) ?? 0;
        totalRecaudado += price;
        if (i == 0) {
          totalComisionesBarberos += price;
        } else {
          totalComisionesBarberos += price * 0.5;
        }
      }
    }

    final otherCuts = todayCuts.where((cut) {
      final cId = (cut['barberId'] ?? cut['idBarbero'] ?? '').toString();
      return !barbers.any((b) => b['id'].toString() == cId);
    }).toList();
    for (var c in otherCuts) {
      totalRecaudado += double.tryParse(c['price'].toString()) ?? 0;
    }

    final gananciaNetaSalon = totalRecaudado - totalComisionesBarberos;

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('BALANCE FINANCIERO', style: GoogleFonts.anton(fontSize: 28, color: Colors.white, letterSpacing: 1)),
                Text(
                  DateFormat('EEEE, d MMMM yyyy', 'es').format(boliviaNow).toUpperCase(),
                  style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: luxuryGold, letterSpacing: 1.5),
                ),
              ],
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(color: Colors.greenAccent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
              child: const Row(
                children: [
                  Icon(Icons.circle, size: 8, color: Colors.greenAccent),
                  SizedBox(width: 6),
                  Text('EN VIVO', style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.greenAccent)),
                ],
              ),
            ),
          ],
        ),

        const SizedBox(height: 25),

        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 14,
          crossAxisSpacing: 14,
          childAspectRatio: 1.35,
          children: [
            _buildCard('RECAUDADO HOY', 'Bs. ${totalRecaudado.toStringAsFixed(0)}', luxuryGold, true),
            _buildCard('NETO SALÓN', 'Bs. ${gananciaNetaSalon.toStringAsFixed(0)}', Colors.greenAccent, false),
            _buildCard('TOTAL COMISIONES', 'Bs. ${totalComisionesBarberos.toStringAsFixed(0)}', Colors.white, false),
            _buildCard('TOTAL SERVICIOS', '${todayCuts.length}', Colors.white38, false),
          ],
        ),

        const SizedBox(height: 35),

        const Text('ACTIVIDAD RECIENTE DEL SALÓN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900, letterSpacing: 2, color: luxuryGold)),
        const SizedBox(height: 15),

        if (todayCuts.isEmpty)
          Container(
            padding: const EdgeInsets.all(40),
            alignment: Alignment.center,
            child: const Text('NO HAY SERVICIOS REGISTRADOS HOY', style: TextStyle(color: Colors.white24, fontSize: 10, fontWeight: FontWeight.w900)),
          ),

        ...todayCuts.take(10).map((cut) {
          return Container(
            margin: const EdgeInsets.only(bottom: 10),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.content_cut_rounded, size: 16, color: luxuryGold),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text((cut['serviceName'] ?? 'Servicio').toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12)),
                      const SizedBox(height: 2),
                      Text(
                        'Barbero: ${(cut['barberName'] ?? 'No asignado')} • Cliente: ${(cut['clientName'] ?? 'Visitante')}',
                        style: const TextStyle(fontSize: 9, color: Colors.white38),
                      ),
                    ],
                  ),
                ),
                Text('Bs. ${cut['price']}', style: GoogleFonts.anton(fontSize: 16, color: Colors.white)),
              ],
            ),
          );
        }),
      ],
    );
  }

  Widget _buildCard(String title, String value, Color color, bool featured) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: featured ? const Color(0xFF141414) : const Color(0xFF090909),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: featured ? luxuryGold.withValues(alpha: 0.4) : Colors.white.withValues(alpha: 0.05)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(title, style: TextStyle(fontSize: 8, fontWeight: FontWeight.w900, color: featured ? luxuryGold : Colors.white38, letterSpacing: 1.5)),
          const SizedBox(height: 6),
          FittedBox(
            fit: BoxFit.scaleDown,
            child: Text(value, style: GoogleFonts.anton(fontSize: 26, color: color, letterSpacing: 1)),
          ),
        ],
      ),
    );
  }
}

// =========================================================================
// 2. STAFF DE BARBEROS
// =========================================================================
class AdminBarbersView extends StatelessWidget {
  const AdminBarbersView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final allUsers = provider.db['users'] ?? [];
    final barbers = allUsers.where((u) => (u['role'] ?? u['rol'] ?? '').toString().toLowerCase() == 'barbero').toList();
    final allCuts = provider.db['cuts'] ?? [];

    final boliviaNow = DateTime.now().toUtc().subtract(const Duration(hours: 4));
    final todayStr = DateFormat('yyyy-MM-dd').format(boliviaNow);
    final todayCuts = allCuts.where((c) => c['date'].toString().startsWith(todayStr)).toList();

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        const Text('RENDIMIENTO Y COMISIONES DE HOY', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
        const SizedBox(height: 20),

        if (barbers.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(50), child: Text('NO HAY BARBEROS REGISTRADOS', style: TextStyle(color: Colors.white24)))),

        ...barbers.map((b) {
          final bId = b['id']?.toString();
          final bDocId = b['docId']?.toString();
          final bName = (b['name'] ?? 'Barbero').toString().trim();

          final bCuts = todayCuts.where((cut) {
            final cId = (cut['barberId'] ?? cut['idBarbero'] ?? cut['barberoId'] ?? '').toString();
            final cName = (cut['barberName'] ?? cut['nombreBarbero'] ?? '').toString().toLowerCase().trim();
            return (bId != null && cId == bId) || 
                   (bDocId != null && cId == bDocId) || 
                   (bName.isNotEmpty && cName == bName.toLowerCase());
          }).toList();

          double totalGenerado = 0;
          double comision = 0;

          bCuts.sort((x, y) => x['date'].toString().compareTo(y['date'].toString()));
          for (int i = 0; i < bCuts.length; i++) {
            double price = double.tryParse(bCuts[i]['price'].toString()) ?? 0;
            totalGenerado += price;
            if (i == 0) {
              comision += price;
            } else {
              comision += price * 0.5;
            }
          }

          return Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.06)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: luxuryGold.withValues(alpha: 0.2),
                      child: Text(
                        bName.isNotEmpty ? bName[0].toUpperCase() : 'B',
                        style: const TextStyle(color: luxuryGold, fontWeight: FontWeight.w900),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(bName.toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Colors.white)),
                          Text('@${b['username'] ?? 'usuario'}', style: const TextStyle(fontSize: 10, color: Colors.white38)),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(color: Colors.greenAccent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                      child: Text('${bCuts.length} CORTES', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w900, color: Colors.greenAccent)),
                    ),
                  ],
                ),
                const Divider(color: Colors.white10, height: 25),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('TOTAL GENERADO', style: TextStyle(fontSize: 8, color: Colors.white38, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('Bs. ${totalGenerado.toStringAsFixed(0)}', style: GoogleFonts.anton(fontSize: 18, color: Colors.white)),
                      ],
                    ),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        const Text('COMISIÓN A PAGAR', style: TextStyle(fontSize: 8, color: luxuryGold, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text('Bs. ${comision.toStringAsFixed(0)}', style: GoogleFonts.anton(fontSize: 18, color: luxuryGold)),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

// =========================================================================
// 3. MONITOR DE TURNOS Y RESERVAS
// =========================================================================
class AdminTurnsView extends StatelessWidget {
  const AdminTurnsView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final turns = provider.db['turns'] ?? [];

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        const Text('CITAS Y TURNOS AGENDADOS EN TIEMPO REAL', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
        const SizedBox(height: 20),

        if (turns.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(50), child: Text('NO HAY RESERVAS REGISTRADAS', style: TextStyle(color: Colors.white24)))),

        ...turns.map((t) {
          final status = (t['status'] ?? 'esperando').toString().toLowerCase();
          final isCompleted = status == 'completado';
          final isWaiting = status == 'esperando';

          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      (t['serviceName'] ?? 'Servicio').toString().toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13, color: Colors.white),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: isCompleted
                            ? Colors.greenAccent.withValues(alpha: 0.1)
                            : isWaiting
                                ? luxuryGold.withValues(alpha: 0.1)
                                : Colors.redAccent.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        status.toUpperCase(),
                        style: TextStyle(
                          fontSize: 9,
                          fontWeight: FontWeight.w900,
                          color: isCompleted ? Colors.greenAccent : isWaiting ? luxuryGold : Colors.redAccent,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Text('Cliente: ${t['clientName'] ?? 'Visitante'} • Tel: ${t['clientPhone'] ?? 'S/N'}', style: const TextStyle(fontSize: 10, color: Colors.white60)),
                Text('Barbero: ${t['barberName'] ?? 'Cualquiera'} • Hora: ${t['scheduledTime'] ?? t['time'] ?? 'S/H'}', style: const TextStyle(fontSize: 10, color: luxuryGold)),
                const SizedBox(height: 12),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    if (isWaiting) ...[
                      OutlinedButton(
                        onPressed: () => provider.updateTurnStatus(t['id'].toString(), 'cancelado'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: Colors.redAccent,
                          side: const BorderSide(color: Colors.redAccent, width: 0.8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        ),
                        child: const Text('CANCELAR', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 8),
                      ElevatedButton(
                        onPressed: () => provider.updateTurnStatus(t['id'].toString(), 'completado'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.greenAccent,
                          foregroundColor: Colors.black,
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        ),
                        child: const Text('COMPLETAR', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900)),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

// =========================================================================
// 4. REGISTRO DE CORTE EXPRESS (MODO ADMIN)
// =========================================================================
class AdminQuickCutView extends StatefulWidget {
  const AdminQuickCutView({super.key});

  @override
  State<AdminQuickCutView> createState() => _AdminQuickCutViewState();
}

class _AdminQuickCutViewState extends State<AdminQuickCutView> {
  String? _selectedServiceId;
  String? _selectedBarberId;
  String? _selectedClientId = 'visitor';
  final _searchController = TextEditingController();
  bool _isSaving = false;
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final services = provider.db['services'] ?? [];
    final barbers = (provider.db['users'] ?? [])
        .where((u) => (u['role'] ?? u['rol'] ?? '').toString().toLowerCase() == 'barbero')
        .toList();
    final clients = provider.db['clients'] ?? [];

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        const Text('REGISTRO DIRECTO DE SERVICIO DESDE EL PANEL DE ADMINISTRADOR', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
        const SizedBox(height: 25),

        // 1. Barbero que realizó el corte
        _buildInputLabel('1. ASIGNAR BARBERO'),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF101010),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: _selectedBarberId,
              hint: const Text('SELECCIONA EL BARBERO...', style: TextStyle(fontSize: 12, color: Colors.white38)),
              dropdownColor: const Color(0xFF101010),
              items: barbers.map((b) {
                return DropdownMenuItem<String>(
                  value: b['id'].toString(),
                  child: Text(b['name'].toString().toUpperCase(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedBarberId = v),
            ),
          ),
        ),

        const SizedBox(height: 22),

        // 2. Servicio realizado
        _buildInputLabel('2. SELECCIONAR SERVICIO'),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 4),
          decoration: BoxDecoration(
            color: const Color(0xFF101010),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: DropdownButtonHideUnderline(
            child: DropdownButton<String>(
              isExpanded: true,
              value: _selectedServiceId,
              hint: const Text('CATÁLOGO DE SERVICIOS...', style: TextStyle(fontSize: 12, color: Colors.white38)),
              dropdownColor: const Color(0xFF101010),
              items: services.map((s) {
                return DropdownMenuItem<String>(
                  value: s['id'].toString(),
                  child: Text('${s['name'].toString().toUpperCase()} - Bs. ${s['price']}', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w900)),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedServiceId = v),
            ),
          ),
        ),

        const SizedBox(height: 22),

        // 3. Cliente
        _buildInputLabel('3. CLIENTE (OPCIONAL)'),
        TextField(
          controller: _searchController,
          onChanged: (v) => setState(() {}),
          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
          decoration: InputDecoration(
            hintText: 'BUSCAR CLIENTE POR NOMBRE O CI...',
            hintStyle: const TextStyle(fontSize: 11, color: Colors.white24),
            prefixIcon: const Icon(Icons.search_rounded, color: luxuryGold, size: 20),
            filled: true,
            fillColor: const Color(0xFF101010),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          ),
        ),

        if (_searchController.text.length > 1)
          Builder(
            builder: (context) {
              final filtered = clients.where((c) =>
                  (c['name'] ?? '').toString().toLowerCase().contains(_searchController.text.toLowerCase()) ||
                  (c['ci'] ?? '').toString().contains(_searchController.text)).toList();
              if (filtered.isEmpty) return const SizedBox.shrink();
              return Container(
                margin: const EdgeInsets.only(top: 8),
                constraints: const BoxConstraints(maxHeight: 140),
                decoration: BoxDecoration(
                  color: const Color(0xFF151515),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
                ),
                child: ListView.separated(
                  shrinkWrap: true,
                  itemCount: filtered.length,
                  separatorBuilder: (_, __) => Divider(height: 1, color: Colors.white.withValues(alpha: 0.05)),
                  itemBuilder: (ctx, idx) {
                    final c = filtered[idx];
                    return ListTile(
                      dense: true,
                      title: Text(c['name'].toString().toUpperCase(), style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                      subtitle: Text('Tel: ${c['phone'] ?? 'S/N'}', style: const TextStyle(fontSize: 9, color: Colors.white38)),
                      onTap: () {
                        setState(() {
                          _selectedClientId = c['id'].toString();
                          _searchController.text = c['name'].toString();
                        });
                      },
                    );
                  },
                ),
              );
            },
          ),

        const SizedBox(height: 35),

        SizedBox(
          width: double.infinity,
          height: 65,
          child: ElevatedButton(
            onPressed: _isSaving ? null : () async {
              final messenger = ScaffoldMessenger.of(context);
              if (_selectedBarberId == null) {
                messenger.showSnackBar(const SnackBar(content: Text('Por favor selecciona qué barbero hizo el corte')));
                return;
              }
              if (_selectedServiceId == null) {
                messenger.showSnackBar(const SnackBar(content: Text('Por favor selecciona el servicio')));
                return;
              }

              setState(() => _isSaving = true);
              final service = services.firstWhere((s) => s['id'].toString() == _selectedServiceId);
              final barber = barbers.firstWhere((b) => b['id'].toString() == _selectedBarberId);
              final client = _selectedClientId == 'visitor' 
                  ? {'name': 'Visitante', 'id': 'visitor'} 
                  : clients.firstWhere((c) => c['id'].toString() == _selectedClientId, orElse: () => {'name': 'Visitante', 'id': 'visitor'});

              final ok = await provider.recordCut({
                'serviceId': service['id'],
                'serviceName': service['name'],
                'price': service['price'],
                'barberId': barber['id'],
                'barberName': barber['name'],
                'idBarbero': barber['id'],
                'clientId': client['id'],
                'clientName': client['name'],
              });

              if (!mounted) return;
              setState(() => _isSaving = false);

              if (ok) {
                messenger.showSnackBar(
                  SnackBar(
                    backgroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Colors.greenAccent)),
                    content: Text('CORTE DE ${barber['name'].toString().toUpperCase()} REGISTRADO', style: const TextStyle(fontWeight: FontWeight.bold)),
                  ),
                );
                setState(() {
                  _selectedServiceId = null;
                  _selectedBarberId = null;
                  _selectedClientId = 'visitor';
                  _searchController.clear();
                });
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: luxuryGold,
              foregroundColor: Colors.black,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
            ),
            child: _isSaving
                ? const CircularProgressIndicator(color: Colors.black)
                : const Text('GUARDAR CORTE EN SISTEMA', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 13)),
          ),
        ),
      ],
    );
  }

  Widget _buildInputLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(text, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
    );
  }
}

// =========================================================================
// 5. SERVICIOS Y TARIFAS
// =========================================================================
class AdminServicesView extends StatelessWidget {
  const AdminServicesView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final services = provider.db['services'] ?? [];

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        const Text('CATÁLOGO VIGENTE DE SERVICIOS EN EL SISTEMA', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
        const SizedBox(height: 20),

        ...services.map((s) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(10),
                  decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                  child: const Icon(Icons.content_cut_rounded, color: luxuryGold, size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(s['name'].toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                      const SizedBox(height: 2),
                      Text('Duración estimada: ${s['duration'] ?? 30} min', style: const TextStyle(fontSize: 9, color: Colors.white38)),
                    ],
                  ),
                ),
                Text('Bs. ${s['price']}', style: GoogleFonts.anton(fontSize: 18, color: luxuryGold)),
              ],
            ),
          );
        }),
      ],
    );
  }
}

// =========================================================================
// 6. CLIENTES REGISTRADOS
// =========================================================================
class AdminClientsView extends StatelessWidget {
  const AdminClientsView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final clients = provider.db['clients'] ?? [];

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        const Text('BASE DE DATOS DE CLIENTES DE LA BARBERÍA', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
        const SizedBox(height: 20),

        if (clients.isEmpty)
          const Center(child: Padding(padding: EdgeInsets.all(50), child: Text('NO HAY CLIENTES REGISTRADOS', style: TextStyle(color: Colors.white24)))),

        ...clients.map((c) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  backgroundColor: Colors.white.withValues(alpha: 0.1),
                  child: Text(
                    (c['name'] ?? 'C')[0].toString().toUpperCase(),
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(c['name'].toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13)),
                      const SizedBox(height: 2),
                      Text('Tel: ${c['phone'] ?? 'Sin teléfono'} • CI: ${c['ci'] ?? 'S/N'}', style: const TextStyle(fontSize: 10, color: Colors.white38)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.15), borderRadius: BorderRadius.circular(6)),
                  child: Text('${c['totalCuts'] ?? 0} CORTES', style: const TextStyle(fontSize: 9, color: luxuryGold, fontWeight: FontWeight.w900)),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}

// =========================================================================
// 7. PERFIL DEL ADMINISTRADOR
// =========================================================================
class AdminProfileView extends StatelessWidget {
  const AdminProfileView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final user = provider.currentUser;

    return ListView(
      padding: const EdgeInsets.all(22),
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF0F0F0F),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: luxuryGold.withValues(alpha: 0.3)),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 30,
                backgroundColor: luxuryGold,
                child: const Icon(Icons.admin_panel_settings_rounded, color: Colors.black, size: 35),
              ),
              const SizedBox(width: 18),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text((user?['name'] ?? 'Administrador').toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(user?['username'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.2), borderRadius: BorderRadius.circular(6)),
                      child: const Text('ROL: ADMINISTRADOR GENERAL', style: TextStyle(color: luxuryGold, fontSize: 8, fontWeight: FontWeight.w900)),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 35),

        SizedBox(
          width: double.infinity,
          height: 60,
          child: ElevatedButton.icon(
            onPressed: () => provider.logout(),
            icon: const Icon(Icons.logout_rounded, size: 20),
            label: const Text('CERRAR SESIÓN DEL SISTEMA', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 12)),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFF220A0A),
              foregroundColor: Colors.redAccent,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.3))),
            ),
          ),
        ),
      ],
    );
  }
}
