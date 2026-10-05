import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import '../providers/barber_provider.dart';

class WelcomeScreen extends StatelessWidget {
  final VoidCallback onContinueToLogin;
  const WelcomeScreen({super.key, required this.onContinueToLogin});

  static const Color luxuryGold = Color(0xFFc5a059);

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<BarberProvider>();

    return Scaffold(
      backgroundColor: Colors.black,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(
          gradient: RadialGradient(
            center: Alignment.topCenter,
            radius: 1.4,
            colors: [
              luxuryGold.withValues(alpha: 0.18),
              Colors.black,
            ],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 32.0, vertical: 20.0),
            child: Column(
              children: [
                const Spacer(flex: 1),

                // LOGO CON RESPLANDOR
                Container(
                  width: 130,
                  height: 130,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: luxuryGold.withValues(alpha: 0.4), width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: luxuryGold.withValues(alpha: 0.25),
                        blurRadius: 40,
                        spreadRadius: 8,
                      ),
                    ],
                  ),
                  child: ClipOval(
                    child: Transform.scale(
                      scale: 1.15,
                      child: Image.asset('assets/logo.png', fit: BoxFit.cover),
                    ),
                  ),
                ),
                const SizedBox(height: 25),

                // TÍTULO Y BADGE
                Text(
                  'URBAN BARBER',
                  style: GoogleFonts.anton(
                    fontSize: 34,
                    color: Colors.white,
                    letterSpacing: 5,
                  ),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
                  decoration: BoxDecoration(
                    color: luxuryGold.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: luxuryGold.withValues(alpha: 0.3)),
                  ),
                  child: const Text(
                    'SISTEMA DE GESTIÓN ELITE & RESERVAS',
                    style: TextStyle(
                      letterSpacing: 2,
                      fontWeight: FontWeight.w900,
                      fontSize: 8,
                      color: luxuryGold,
                    ),
                  ),
                ),

                const Spacer(flex: 1),

                // CARACTERÍSTICAS DESTACADAS
                _buildFeatureRow(
                  Icons.content_cut_rounded,
                  'CORTES & BARBA',
                  'Servicios de alta gama y atención de primer nivel.',
                ),
                const SizedBox(height: 16),
                _buildFeatureRow(
                  Icons.event_available_rounded,
                  'RESERVAS EN LÍNEA',
                  'Agenda tu turno con tu barbero favorito al instante.',
                ),
                const SizedBox(height: 16),
                _buildFeatureRow(
                  Icons.analytics_rounded,
                  'PANEL INTELIGENTE',
                  'Acceso diferenciado para Clientes, Barberos y Admin.',
                ),

                const Spacer(flex: 2),

                // BOTÓN ACCEDER (USUARIO / CONTRASEÑA)
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: ElevatedButton(
                    onPressed: provider.isLoading ? null : onContinueToLogin,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: luxuryGold,
                      foregroundColor: Colors.black,
                      elevation: 12,
                      shadowColor: luxuryGold.withValues(alpha: 0.4),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: const Text(
                      'INGRESAR AL SISTEMA',
                      style: TextStyle(fontWeight: FontWeight.w900, letterSpacing: 2, fontSize: 13),
                    ),
                  ),
                ),
                const SizedBox(height: 14),

                // BOTÓN GOOGLE SIGN-IN
                SizedBox(
                  width: double.infinity,
                  height: 60,
                  child: OutlinedButton(
                    onPressed: provider.isLoading
                        ? null
                        : () async {
                            final messenger = ScaffoldMessenger.of(context);
                            final success = await provider.loginWithGoogle();
                            if (!success && provider.errorMessage != null) {
                              messenger.showSnackBar(
                                SnackBar(
                                  backgroundColor: const Color(0xFF220A0A),
                                  content: Text(
                                    provider.errorMessage!,
                                    style: const TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold),
                                  ),
                                ),
                              );
                            }
                          },
                    style: OutlinedButton.styleFrom(
                      backgroundColor: const Color(0xFF111111),
                      side: BorderSide(color: Colors.white.withValues(alpha: 0.15)),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    child: provider.isLoading
                        ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(color: luxuryGold, strokeWidth: 2),
                          )
                        : Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Image.network(
                                'https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg',
                                width: 20,
                                height: 20,
                                errorBuilder: (_, __, ___) => const Icon(Icons.g_mobiledata_rounded, color: Colors.white, size: 24),
                              ),
                              const SizedBox(width: 12),
                              const Text(
                                'CONTINUAR CON GOOGLE',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.w900,
                                  letterSpacing: 1.5,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),

                const SizedBox(height: 10),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureRow(IconData icon, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF0D0D0D),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white.withValues(alpha: 0.04)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: luxuryGold.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: luxuryGold, size: 20),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 11, letterSpacing: 1),
                ),
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: const TextStyle(color: Colors.white38, fontSize: 9, fontWeight: FontWeight.w500),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
