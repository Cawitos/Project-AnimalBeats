import 'dart:convert';
import 'package:flutter/material.dart';
import 'menu.dart';
import 'package:http/http.dart' as http;
import 'Estadisticas_page.dart';

const String apiUrl = "https://animalbeats-api.onrender.com";

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  _AdminDashboardState createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  Map<String, dynamic>? dashboardData;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchDashboard();
  }

  Future<void> _fetchDashboard() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/admin/dashboard"));
      if (response.statusCode == 200) {
        setState(() {
          dashboardData = jsonDecode(response.body);
          loading = false;
        });
      } else {
        setState(() {
          error = "Error del servidor: ${response.statusCode}";
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = "No se pudo cargar el dashboard";
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    int userRole = 1;

    if (loading) {
      return Scaffold(
        appBar: AppBar(title: const Text("Dashboard Admin")),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text("Dashboard Admin"),
        ),
        body: Center(
          child: Text(
            error!,
            style: const TextStyle(color: Colors.red, fontSize: 18),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "Dashboard Admin",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.red,
      ),
      drawer: OffcanvasMenu(userRole: userRole),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Perfil de usuario
          Card(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 4,
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text("Perfil de Usuario",
                      style:
                          TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 10),
                  Text("Administrador",
                      style:
                          TextStyle(fontSize: 18, color: Colors.grey.shade700)),
                  const SizedBox(height: 10),
                  Text("Nombre: ${dashboardData!["usuario"]["nombre"]}"),
                  Text("Correo: ${dashboardData!["usuario"]["correo"]}"),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Botón para estadísticas
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            icon: const Icon(Icons.bar_chart, color: Colors.white),
            label: const Text(
              "Ver estadísticas",
              style: TextStyle(fontSize: 18, color: Colors.white),
            ),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                    builder: (context) => const EstadisticasPage()),
              );
            },
          ),
        ],
      ),
    );
  }
}
