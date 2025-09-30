import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-api.onrender.com";

class EstadoRolesPage extends StatefulWidget {
  const EstadoRolesPage({super.key});

  @override
  _EstadoRolesPageState createState() => _EstadoRolesPageState();
}

class _EstadoRolesPageState extends State<EstadoRolesPage> {
  List roles = [];
  final TextEditingController _nuevoRolController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarRoles();
  }

  Future<void> _cargarRoles() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/roles/Listado"));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          roles = data["roles"] ?? [];
        });
      }
    } catch (e) {
      print("Error al cargar roles: $e");
    }
  }

  Future<void> _agregarRol() async {
    if (_nuevoRolController.text.trim().isEmpty) return;

    try {
      final response = await http.post(
        Uri.parse("$apiUrl/roles/Crear"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"rol": _nuevoRolController.text.trim()}),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _nuevoRolController.clear();
        _cargarRoles();
      }
    } catch (e) {
      print("Error al agregar rol: $e");
    }
  }

  Future<void> _eliminarRol(int id) async {
    try {
      final response =
          await http.delete(Uri.parse("$apiUrl/roles/Eliminar/$id"));

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Rol eliminado correctamente")),
        );
        _cargarRoles();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error al eliminar rol")),
        );
      }
    } catch (e) {
      print("Error al eliminar rol: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Gestión de Roles"),
        backgroundColor: Colors.red,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Text(
              "Tabla de Roles",
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            Expanded(
              child: ListView.builder(
                itemCount: roles.length,
                itemBuilder: (context, index) {
                  final rol = roles[index];
                  return Card(
                    child: ListTile(
                      title: Text("ID: ${rol["id"]} - ${rol["rol"]}"),
                      trailing: IconButton(
                        icon: const Icon(Icons.delete, color: Colors.red),
                        onPressed: () => _eliminarRol(rol["id"]),
                      ),
                    ),
                  );
                },
              ),
            ),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _nuevoRolController,
                    decoration: const InputDecoration(
                      labelText: "Nuevo rol",
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: _agregarRol,
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
                  child: const Text("Agregar"),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
