import 'package:flutter/material.dart';

// 👇 importar las vistas hechas
import 'admin.dart';
import 'gestion_mascotas.dart';
import 'main.dart';
import 'gestion_usuarios.dart';
import 'gestion_recordatorios.dart';

class OffcanvasMenu extends StatefulWidget {
  final int userRole;
  final String? nDocumento;
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
            DrawerHeader(
              decoration: const BoxDecoration(
                color: Color(0xFFDF2935), // Rojo principal
              ),
              child: Center(
                child: TextButton(
                  onPressed: () {
                    if (widget.userRole == 1) {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                            builder: (context) => const AdminDashboard()),
                      );
                    } else if (widget.userRole == 3) {
                      // Navigator.push(
                      //   context,
                      //   MaterialPageRoute(builder: (context) => const VeterinarioPage()),
                      // );
                    } else {
                      // Navigator.push(
                      //   context,
                      //   MaterialPageRoute(builder: (context) => const ClientePage()),
                      // );
                    }
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'AnimalBeats',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                ),
              ),
            ),
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
                    title: const Text('Estados y roles'),
                    // onTap: () {
                    //   Navigator.push(
                    //     context,
                    //     MaterialPageRoute(builder: (context) => const EstadosRolesPage()),
                    //   );
                    // },
                  ),
                ],
              ),
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
                        builder: (context) =>
                            GestionMascotas(userRole: widget.userRole),
                      ),
                    );
                  },
                ),
                ListTile(
                  leading: const Icon(Icons.category, color: Colors.black54),
                  title: const Text('Especies y Razas'),
                  // onTap: () {
                  //   Navigator.push(
                  //     context,
                  //     MaterialPageRoute(builder: (context) => const EspeciesPage()),
                  //   );
                  // },
                ),
                ListTile(
                  leading: const Icon(Icons.healing, color: Colors.black54),
                  title: const Text('Enfermedades'),
                  // onTap: () {
                  //   Navigator.push(
                  //     context,
                  //     MaterialPageRoute(builder: (context) => const EnfermedadesPage()),
                  //   );
                  // },
                ),
                ListTile(
                  leading:
                      const Icon(Icons.calendar_today, color: Colors.black54),
                  title: const Text('Citas'),
                  // onTap: () {
                  //   Navigator.push(
                  //     context,
                  //     MaterialPageRoute(builder: (context) => const CitasPage()),
                  //   );
                  // },
                ),
              ],
            ),
            if (widget.userRole != 2)
            ListTile(
              leading: const Icon(Icons.alarm, color: Color(0xFFDF2935)),
              title: const Text('Recordatorios'),
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => GestionRecordatorios(
                      userRole: widget.userRole,
                      nDocumento: widget.nDocumento,
                    ),
                  ),
                );
              },
            ),
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
