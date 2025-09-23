import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'storage_service.dart';

class ClienteDashboard extends StatefulWidget {
  const ClienteDashboard({Key? key}) : super(key: key);

  @override
  State<ClienteDashboard> createState() => _ClienteDashboardState();
}

class _ClienteDashboardState extends State<ClienteDashboard> {
  late Future<Map<String, dynamic>> dashboardFuture;

  @override
  void initState() {
    super.initState();
    dashboardFuture = fetchDashboardData();
  }

  Future<Map<String, dynamic>> fetchDashboardData() async {
    final prefs = await SharedPreferences.getInstance();

    // ✅ Obtener documento usando la misma clave que se guarda en el login
    final documento = prefs.getString('nDocumento');
    final token = prefs.getString('token');

    if (documento == null || documento.isEmpty) {
      throw Exception('No se encontró el documento del usuario');
    }

    final url = Uri.parse(
      'https://animalbeats-backend-production.up.railway.app/cliente/dashboard/$documento',
    );

    final res = await http.get(
      url,
      headers: {
        'Authorization': 'Bearer $token',
        'Content-Type': 'application/json',
      },
    );

    if (res.statusCode != 200) {
      throw Exception('Error del servidor: ${res.statusCode}');
    }

    return jsonDecode(res.body);
  }

  Widget buildStatItem(IconData icon, String title, dynamic value) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.red,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, size: 40, color: Colors.white),
          const SizedBox(width: 16),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                value?.toString() ?? '0',
                style: const TextStyle(fontSize: 20, color: Colors.white),
              ),
            ],
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[200],
      appBar: AppBar(
        title: const Text('Cliente Dashboard'),
        backgroundColor: Colors.red,
      ),
      body: FutureBuilder<Map<String, dynamic>>(
        future: dashboardFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(
              child: Text(
                snapshot.error.toString(),
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            );
          }

          final data = snapshot.data ?? {};
          final usuario = data['usuario'] ?? {};
          final stats = data['stats'] ?? {};

          return SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // PERFIL DE USUARIO
                Card(
                  elevation: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'PERFIL DE USUARIO',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text('Nombre: ${usuario['nombre'] ?? 'N/A'}'),
                        Text('Correo: ${usuario['correo'] ?? 'N/A'}'),
                        Text('Mascotas: ${usuario['mascotas'] ?? 0}'),
                      ],
                    ),
                  ),
                ),

                // ESTADÍSTICAS
                const Text(
                  'ESTADÍSTICAS GENERALES',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 10),

                buildStatItem(Icons.pets, 'Mascotas Añadidas',
                    stats['mascotas_agregadas']),
                buildStatItem(Icons.event_note, 'Citas Pendientes',
                    stats['citas_pendientes']),
              ],
            ),
          );
        },
      ),
    );
  }
}
