import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-api.onrender.com";

class EstadisticasPage extends StatefulWidget {
  const EstadisticasPage({super.key});

  @override
  _EstadisticasPageState createState() => _EstadisticasPageState();
}

class _EstadisticasPageState extends State<EstadisticasPage> {
  Map<String, dynamic>? dashboardData;
  List<dynamic> roles = [];
  bool loading = true;
  String? error;

  int _totalMascotas = 0;
  int _totalRecordatorios = 0;

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      final dashResponse = await http.get(Uri.parse("$apiUrl/admin/dashboard"));
      final rolesResponse = await http.get(Uri.parse("$apiUrl/roles/Listado"));
      final mascotasResponse = await http.get(Uri.parse("$apiUrl/Mascotas"));
      final recordatoriosResponse = await http.get(Uri.parse("$apiUrl/recordatorios"));

      if (dashResponse.statusCode == 200 &&
          rolesResponse.statusCode == 200 &&
          mascotasResponse.statusCode == 200 &&
          recordatoriosResponse.statusCode == 200) {
        setState(() {
          dashboardData = jsonDecode(dashResponse.body);
          roles = jsonDecode(rolesResponse.body)["roles"];

          final mascotasData = jsonDecode(mascotasResponse.body);
          _totalMascotas = mascotasData is List ? mascotasData.length : 0;

          final recordatoriosData = jsonDecode(recordatoriosResponse.body);
          _totalRecordatorios =
              recordatoriosData is List ? recordatoriosData.length : 0;

          loading = false;
        });
      } else {
        setState(() {
          error =
              "Error al obtener datos:\nDashboard(${dashResponse.statusCode}),\nRoles(${rolesResponse.statusCode}),\nMascotas(${mascotasResponse.statusCode}),\nRecordatorios(${recordatoriosResponse.statusCode})";
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = "No se pudieron cargar las estadísticas: $e";
        loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return Scaffold(
        appBar: AppBar(title: const Text("Estadísticas")),
        body: const Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Estadísticas")),
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
        title: const Text("Estadísticas"),
        backgroundColor: Colors.red,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // Conteo de clientes / veterinarios
          Card(
            color: Colors.red.shade50,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 4,
            child: ListTile(
              leading: const Icon(Icons.people, color: Colors.red),
              title: const Text("Total Clientes / Veterinarios"),
              trailing: Text(
                "${dashboardData!["total_clientes"]}",
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // Listado de roles
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
                    const Text("Roles en el sistema",
                        style: TextStyle(
                            fontSize: 22, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 10),
                    ...roles.map((rol) => ListTile(
                          leading: const Icon(Icons.check_circle,
                              color: Colors.red),
                          title: Text("ID: ${rol["id"]}"),
                          subtitle: Text("Rol: ${rol["rol"]}"),
                        )),
                  ]),
            ),
          ),

          const SizedBox(height: 20),

          Card(
            color: Colors.red.shade50,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            elevation: 4,
            child: ListTile(
              leading: const Icon(Icons.pets, color: Colors.red),
              title: const Text("Total de Mascotas"),
              subtitle:
                  Text("Recordatorios asignados: $_totalRecordatorios"),
              trailing: Text(
                "$_totalMascotas",
                style:
                    const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
