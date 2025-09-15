import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-backend-production.up.railway.app";

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

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    try {
      // Llamar al dashboard
      final dashResponse =
          await http.get(Uri.parse("$apiUrl/admin/dashboard"));
      // Llamar a roles
      final rolesResponse =
          await http.get(Uri.parse("$apiUrl/roles/Listado"));

      if (dashResponse.statusCode == 200 && rolesResponse.statusCode == 200) {
        setState(() {
          dashboardData = jsonDecode(dashResponse.body);
          roles = jsonDecode(rolesResponse.body)["roles"];
          loading = false;
        });
      } else {
        setState(() {
          error =
              "Error al obtener datos: Dashboard(${dashResponse.statusCode}), Roles(${rolesResponse.statusCode})";
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = "No se pudieron cargar las estadísticas";
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
                style: const TextStyle(
                    fontSize: 20, fontWeight: FontWeight.bold),
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
        ],
      ),
    );
  }
}