import 'package:flutter/material.dart';

// 👇 importar las vistas hechas
import 'admin.dart';
import 'gestion_mascotas.dart';
import 'main.dart';
import 'gestion_usuarios.dart';
import 'gestion_recordatorios.dart';
import 'roles.dart';
import 'especies.dart';

class OffcanvasMenu extends StatefulWidget {
  final int userRole;        // 👈 ahora viene de login (usuario['rol'])
  final String? nDocumento;  // 👈 ahora viene de login (usuario['n_documento'])

  const OffcanvasMenu({super.key, required this.userRole, this.nDocumento});

  @override
  State<OffcanvasMenu> createState() => _OffcanvasMenuState();
}

class _OffcanvasMenuState extends State<OffcanvasMenu> {
  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        color: const Color(0xFFFDF7FA), // Fondo claro
        child: ListView(
          padding: EdgeInsets.zero,
          children: [
            // ---------- HEADER CON LOGO ----------
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Color(0xFFDF2935), // Rojo principal
              ),
              child: Center(
                child: GestureDetector(
                  onTap: () {
                    if (widget.userRole == 1) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const AdminDashboard()),
                      );
                    } else if (widget.userRole == 3) {
                      // Aquí luego enlazas VeterinarioDashboard
                    } else {
                      // Aquí luego enlazas ClienteDashboard
                    }
                    Navigator.pop(context);
                  },
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Image.asset(
                        'img/logo.png', // 👈 tu logo
                        height: 80,
                      ),
                      const SizedBox(height: 10),
                    ],
                  ),
                ),
              ),
            ),

            // ---------- GESTIÓN DE USUARIOS ----------
            if (widget.userRole == 1)
              ExpansionTile(
                leading: const Icon(Icons.group, color: Color(0xFFDF2935)),
                title: const Text(
                  'Gestión de usuarios',
                  style: TextStyle(fontWeight: FontWeight.w600),
                ),
                children: [
                  ListTile(
                    leading: const Icon(Icons.person, color: Colors.black54),
                    title: const Text('Usuarios'),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const GestionUsuariosPage()),
                      );
                    },
                  ),
                  ListTile(
                    leading: const Icon(Icons.admin_panel_settings,
                        color: Colors.black54),
                    title: const Text('Roles'),
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const EstadoRolesPage()),
                      );
                    },
                  ),
                ],
              ),

            // ---------- GESTIÓN DE MASCOTAS ----------
            ExpansionTile(
              leading: const Icon(Icons.pets, color: Color(0xFFDF2935)),
              title: const Text(
                'Gestión de Mascotas',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
              children: [
                ListTile(
                  leading: const Icon(Icons.list, color: Colors.black54),
                  title: const Text('Mascotas'),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => GestionMascotas(
                          userRole: widget.userRole,
                          
                        ),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.category, color: Colors.black54),
                  title: const Text('Especies y Razas'),
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => EspeciesPage(
                          userRole: widget.userRole,
                          nDocumento: widget.nDocumento,
                        ),
                      ),
                    );
                  },
                ),

                ListTile(
                  leading: const Icon(Icons.healing, color: Colors.black54),
                  title: const Text('Enfermedades'),
                  // Aquí luego puedes enlazar EnfermedadesPage
                ),
                ListTile(
                  leading:
                      const Icon(Icons.calendar_today, color: Colors.black54),
                  title: const Text('Citas'),
                  // Aquí luego puedes enlazar CitasPage
                ),
              ],
            ),

            // ---------- RECORDATORIOS ----------
            if (widget.userRole != 2) // 👈 solo admin y veterinario
              ListTile(
                leading: const Icon(Icons.alarm, color: Color(0xFFDF2935)),
                title: const Text('Recordatorios'),
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => GestionRecordatorios(
                        userRole: widget.userRole,
                        nDocumento: widget.nDocumento, // 👈 se pasa también
                      ),
                    ),
                  );
                },
              ),

            // ---------- SALIR ----------
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.redAccent),
              title: const Text(
                'Salir',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              onTap: () {
                Navigator.pushAndRemoveUntil(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const AnimalBeatsApp()),
                  (route) => false,
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
