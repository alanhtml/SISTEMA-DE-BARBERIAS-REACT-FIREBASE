import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/barber_provider.dart';

class ClientNavigation extends StatefulWidget {
  const ClientNavigation({super.key});

  @override
  State<ClientNavigation> createState() => _ClientNavigationState();
}

class _ClientNavigationState extends State<ClientNavigation> {
  int _selectedIndex = 0;
  static const Color luxuryGold = Color(0xFFc5a059);

  final List<Widget> _pages = [
    const ClientBookingView(),
    const ClientMyTurnsView(),
    const ClientServicesView(),
    const ClientProfileView(),
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
              icon: Icon(Icons.calendar_month_rounded, size: 22),
              selectedIcon: Icon(Icons.calendar_month_rounded, color: luxuryGold, size: 26),
              label: 'Reservar',
            ),
            NavigationDestination(
              icon: Icon(Icons.confirmation_number_rounded, size: 22),
              selectedIcon: Icon(Icons.confirmation_number_rounded, color: luxuryGold, size: 26),
              label: 'Mis Citas',
            ),
            NavigationDestination(
              icon: Icon(Icons.content_cut_rounded, size: 22),
              selectedIcon: Icon(Icons.content_cut_rounded, color: luxuryGold, size: 26),
              label: 'Servicios',
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

// --- VISTA 1: RESERVAR CITA CLIENTE ---
class ClientBookingView extends StatefulWidget {
  const ClientBookingView({super.key});

  @override
  State<ClientBookingView> createState() => _ClientBookingViewState();
}

class _ClientBookingViewState extends State<ClientBookingView> {
  static const Color luxuryGold = Color(0xFFc5a059);

  Map<String, dynamic>? _selectedService;
  Map<String, dynamic>? _selectedBarber;
  DateTime _selectedDate = DateTime.now();
  String? _selectedTime;
  final _phoneController = TextEditingController();
  bool _isBooking = false;

  final List<String> _timeSlots = const [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30"
  ];

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final services = provider.db['services'] ?? [];
    final barbers = (provider.db['users'] ?? [])
        .where((u) => (u['role'] ?? u['rol'] ?? '').toString().toLowerCase() == 'barbero')
        .toList();

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          Text('RESERVA TU', style: GoogleFonts.anton(fontSize: 38, color: Colors.white, height: 0.9, letterSpacing: 1)),
          Text('CITA ONLINE', style: GoogleFonts.anton(fontSize: 38, color: luxuryGold, height: 0.9, letterSpacing: 1)),
          const SizedBox(height: 5),
          const Text('ELIGE TU SERVICIO, BARBERO Y HORARIO', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),

          const SizedBox(height: 30),

          // 1. SELECCIONAR SERVICIO
          _buildStepTitle('1. SELECCIONA EL SERVICIO'),
          SizedBox(
            height: 120,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: services.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                final s = services[index];
                final isSelected = _selectedService?['id'] == s['id'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedService = s),
                  child: Container(
                    width: 150,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF1E1A10) : const Color(0xFF0F0F0F),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isSelected ? luxuryGold : Colors.white.withValues(alpha: 0.05), width: isSelected ? 1.5 : 1),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          (s['name'] ?? 'Servicio').toString().toUpperCase(),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: isSelected ? luxuryGold : Colors.white),
                        ),
                        const Spacer(),
                        Text('Bs. ${s['price']}', style: GoogleFonts.anton(fontSize: 18, color: Colors.white)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 30),

          // 2. SELECCIONAR BARBERO
          _buildStepTitle('2. SELECCIONA EL BARBERO'),
          SizedBox(
            height: 80,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: barbers.length + 1,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                if (index == 0) {
                  final isSelected = _selectedBarber == null;
                  return GestureDetector(
                    onTap: () => setState(() => _selectedBarber = null),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 18),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF1E1A10) : const Color(0xFF0F0F0F),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: isSelected ? luxuryGold : Colors.white.withValues(alpha: 0.05)),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.shuffle_rounded, color: isSelected ? luxuryGold : Colors.white60, size: 20),
                          const SizedBox(width: 8),
                          Text('CUALQUIERA', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: isSelected ? luxuryGold : Colors.white)),
                        ],
                      ),
                    ),
                  );
                }

                final b = barbers[index - 1];
                final isSelected = _selectedBarber?['id'] == b['id'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedBarber = b),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 18),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF1E1A10) : const Color(0xFF0F0F0F),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: isSelected ? luxuryGold : Colors.white.withValues(alpha: 0.05)),
                    ),
                    child: Row(
                      children: [
                        CircleAvatar(
                          radius: 14,
                          backgroundColor: luxuryGold.withValues(alpha: 0.2),
                          child: Text(
                            (b['name'] ?? 'B')[0].toString().toUpperCase(),
                            style: const TextStyle(fontSize: 10, color: luxuryGold, fontWeight: FontWeight.bold),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          (b['name'] ?? 'Barbero').toString().toUpperCase(),
                          style: TextStyle(fontWeight: FontWeight.w900, fontSize: 11, color: isSelected ? luxuryGold : Colors.white),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 30),

          // 3. SELECCIONAR FECHA
          _buildStepTitle('3. SELECCIONA LA FECHA'),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  DateFormat('EEEE, d MMMM yyyy', 'es').format(_selectedDate).toUpperCase(),
                  style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 12, color: Colors.white),
                ),
                IconButton(
                  icon: const Icon(Icons.calendar_today_rounded, color: luxuryGold, size: 20),
                  onPressed: () async {
                    final picked = await showDatePicker(
                      context: context,
                      initialDate: _selectedDate,
                      firstDate: DateTime.now(),
                      lastDate: DateTime.now().add(const Duration(days: 30)),
                    );
                    if (picked != null) setState(() => _selectedDate = picked);
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 30),

          // 4. SELECCIONAR HORARIO
          _buildStepTitle('4. SELECCIONA LA HORA'),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: _timeSlots.map((time) {
              final isSelected = _selectedTime == time;
              return GestureDetector(
                onTap: () => setState(() => _selectedTime = time),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: isSelected ? luxuryGold : const Color(0xFF0F0F0F),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: isSelected ? luxuryGold : Colors.white.withValues(alpha: 0.05)),
                  ),
                  child: Text(
                    time,
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 11,
                      color: isSelected ? Colors.black : Colors.white70,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),

          const SizedBox(height: 30),

          // 5. TELÉFONO DE CONTACTO
          _buildStepTitle('5. TELÉFONO O WHATSAPP'),
          TextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
            decoration: InputDecoration(
              hintText: 'NÚMERO DE TELÉFONO...',
              hintStyle: const TextStyle(fontSize: 11, color: Colors.white24, fontWeight: FontWeight.bold),
              prefixIcon: const Icon(Icons.phone_rounded, color: luxuryGold, size: 20),
              filled: true,
              fillColor: const Color(0xFF0F0F0F),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(vertical: 16),
            ),
          ),

          const SizedBox(height: 40),

          // BOTÓN FINALIZAR RESERVA
          SizedBox(
            width: double.infinity,
            height: 65,
            child: ElevatedButton(
              onPressed: _isBooking ? null : () => _handleConfirmBooking(context, provider),
              style: ElevatedButton.styleFrom(
                backgroundColor: luxuryGold,
                foregroundColor: Colors.black,
                elevation: 15,
                shadowColor: luxuryGold.withValues(alpha: 0.4),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isBooking
                  ? const CircularProgressIndicator(color: Colors.black)
                  : const Text('CONFIRMAR RESERVA', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 13)),
            ),
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }

  Widget _buildStepTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12, left: 4),
      child: Text(text, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),
    );
  }

  void _handleConfirmBooking(BuildContext context, BarberProvider provider) async {
    final messenger = ScaffoldMessenger.of(context);
    if (_selectedService == null) {
      messenger.showSnackBar(const SnackBar(content: Text('Por favor selecciona un servicio')));
      return;
    }
    if (_selectedTime == null) {
      messenger.showSnackBar(const SnackBar(content: Text('Por favor selecciona un horario')));
      return;
    }

    final dateStr = DateFormat('yyyy-MM-dd').format(_selectedDate);
    final user = provider.currentUser;

    setState(() => _isBooking = true);

    final success = await provider.addTurn(
      serviceId: _selectedService!['id'].toString(),
      serviceName: _selectedService!['name'].toString(),
      servicePrice: double.tryParse(_selectedService!['price'].toString()) ?? 0,
      barberId: _selectedBarber?['id']?.toString() ?? 'cualquiera',
      barberName: _selectedBarber?['name']?.toString() ?? 'Cualquier Barbero',
      date: dateStr,
      time: _selectedTime!,
      clientName: user?['name'] ?? 'Cliente',
      clientPhone: _phoneController.text.trim().isNotEmpty ? _phoneController.text.trim() : (user?['phone'] ?? ''),
    );

    if (!mounted) return;
    setState(() => _isBooking = false);

    if (success) {
      messenger.showSnackBar(
        SnackBar(
          backgroundColor: Colors.black,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10), side: const BorderSide(color: Colors.greenAccent)),
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.greenAccent),
              const SizedBox(width: 12),
              Expanded(
                child: Text('¡CITA RESERVADA PARA LAS $_selectedTime!', style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 11)),
              ),
            ],
          ),
        ),
      );
      setState(() {
        _selectedService = null;
        _selectedBarber = null;
        _selectedTime = null;
      });
    } else {
      messenger.showSnackBar(const SnackBar(content: Text('Error al reservar turno. Intenta de nuevo.')));
    }
  }
}

// --- VISTA 2: MIS TURNOS DEL CLIENTE ---
class ClientMyTurnsView extends StatelessWidget {
  const ClientMyTurnsView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final allTurns = provider.db['turns'] ?? [];
    final user = provider.currentUser;
    final myEmail = (user?['username'] ?? '').toString().toLowerCase();
    final myId = (user?['id'] ?? '').toString();

    final myTurns = allTurns.where((t) {
      final tEmail = (t['clientUsername'] ?? '').toString().toLowerCase();
      final tId = (t['clientId'] ?? '').toString();
      return (myEmail.isNotEmpty && tEmail == myEmail) || (myId.isNotEmpty && tId == myId);
    }).toList();

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          Text('MIS CITAS &', style: GoogleFonts.anton(fontSize: 38, color: Colors.white, height: 0.9, letterSpacing: 1)),
          Text('RESERVAS', style: GoogleFonts.anton(fontSize: 38, color: luxuryGold, height: 0.9, letterSpacing: 1)),
          const SizedBox(height: 5),
          const Text('HISTORIAL Y ESTADO DE TUS TURNOS', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),

          const SizedBox(height: 25),

          if (myTurns.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.all(60),
                child: Column(
                  children: [
                    Icon(Icons.confirmation_number_outlined, size: 48, color: Colors.white.withValues(alpha: 0.1)),
                    const SizedBox(height: 15),
                    const Text('NO TIENES CITAS ACTIVAS', style: TextStyle(color: Colors.white24, fontWeight: FontWeight.w900, fontSize: 10, letterSpacing: 2)),
                  ],
                ),
              ),
            ),

          ...myTurns.map((turn) {
            final status = (turn['status'] ?? 'esperando').toString().toLowerCase();
            final isCompleted = status == 'completado';
            final isWaiting = status == 'esperando';

            return Container(
              margin: const EdgeInsets.only(bottom: 14),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F0F),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        (turn['serviceName'] ?? 'Servicio').toString().toUpperCase(),
                        style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 14, color: Colors.white),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: isCompleted ? Colors.greenAccent.withValues(alpha: 0.1) : luxuryGold.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          status.toUpperCase(),
                          style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: isCompleted ? Colors.greenAccent : luxuryGold),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text('Barbero: ${turn['barberName'] ?? 'Cualquiera'}', style: const TextStyle(fontSize: 11, color: Colors.white60)),
                  Text('Fecha y Hora: ${turn['scheduledTime'] ?? turn['scheduledDate'] ?? 'S/F'}', style: const TextStyle(fontSize: 11, color: luxuryGold, fontWeight: FontWeight.bold)),
                  if (turn['price'] != null)
                    Text('Precio: Bs. ${turn['price']}', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                  
                  if (isWaiting) ...[
                    const Divider(color: Colors.white10, height: 20),
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () => provider.updateTurnStatus(turn['id'].toString(), 'cancelado'),
                        style: TextButton.styleFrom(foregroundColor: Colors.redAccent),
                        child: const Text('CANCELAR ESTA CITA', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w900)),
                      ),
                    ),
                  ],
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

// --- VISTA 3: CATÁLOGO DE SERVICIOS ---
class ClientServicesView extends StatelessWidget {
  const ClientServicesView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final services = provider.db['services'] ?? [];

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          Text('CATÁLOGO DE', style: GoogleFonts.anton(fontSize: 38, color: Colors.white, height: 0.9, letterSpacing: 1)),
          Text('SERVICIOS', style: GoogleFonts.anton(fontSize: 38, color: luxuryGold, height: 0.9, letterSpacing: 1)),
          const SizedBox(height: 5),
          const Text('PRECIOS Y OPCIONES DISPONIBLES', style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.white38, letterSpacing: 1.5)),

          const SizedBox(height: 25),

          ...services.map((s) {
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF0F0F0F),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: luxuryGold.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(10)),
                    child: const Icon(Icons.content_cut_rounded, size: 20, color: luxuryGold),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Text(
                      (s['name'] ?? 'Servicio').toString().toUpperCase(),
                      style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 13),
                    ),
                  ),
                  Text('Bs. ${s['price']}', style: GoogleFonts.anton(fontSize: 18, color: luxuryGold)),
                ],
              ),
            );
          }),
        ],
      ),
    );
  }
}

// --- VISTA 4: PERFIL CLIENTE ---
class ClientProfileView extends StatelessWidget {
  const ClientProfileView({super.key});
  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();
    final user = provider.currentUser;

    return SafeArea(
      child: ListView(
        padding: const EdgeInsets.all(25),
        children: [
          Text('MI PERFIL', style: GoogleFonts.anton(fontSize: 38, color: Colors.white, height: 0.9, letterSpacing: 1)),
          Text('CLIENTE', style: GoogleFonts.anton(fontSize: 38, color: luxuryGold, height: 0.9, letterSpacing: 1)),
          const SizedBox(height: 25),

          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF0F0F0F),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withValues(alpha: 0.08)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 30,
                  backgroundColor: luxuryGold.withValues(alpha: 0.2),
                  child: Text(
                    (user?['name'] ?? 'C')[0].toString().toUpperCase(),
                    style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: luxuryGold),
                  ),
                ),
                const SizedBox(width: 18),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text((user?['name'] ?? 'Cliente').toString().toUpperCase(), style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16)),
                      const SizedBox(height: 4),
                      Text(user?['username'] ?? '', style: const TextStyle(fontSize: 11, color: Colors.white38)),
                      const SizedBox(height: 6),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                        decoration: BoxDecoration(color: Colors.greenAccent.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(6)),
                        child: const Text('CLIENTE REGISTRADO', style: TextStyle(color: Colors.greenAccent, fontSize: 8, fontWeight: FontWeight.w900)),
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
              label: const Text('CERRAR SESIÓN', style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 1.5, fontSize: 12)),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF220A0A),
                foregroundColor: Colors.redAccent,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12), side: BorderSide(color: Colors.redAccent.withValues(alpha: 0.3))),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
