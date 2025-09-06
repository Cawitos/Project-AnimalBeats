import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-backend-production.up.railway.app";

class GestionUsuariosPage extends StatefulWidget {
  const GestionUsuariosPage({super.key});

  @override
  _GestionUsuariosPageState createState() => _GestionUsuariosPageState();
}

class _GestionUsuariosPageState extends State<GestionUsuariosPage> {
  List<dynamic> usuarios = [];
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchUsuarios();
  }

  Future<void> _fetchUsuarios() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/usuario/Listado"));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        print("Respuesta JSON: $data"); // 👈 Para debug

        setState(() {
          if (data is List) {
            usuarios = data;
          } else if (data is Map &&
              (data.containsKey("usuarios") || data.containsKey("Usuarios"))) {
            usuarios = data["usuarios"] ?? data["Usuarios"];
          } else {
            usuarios = [];
            error = "Formato inesperado en la respuesta: $data";
          }
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
        error = "Error de conexión: $e";
        loading = false;
      });
    }
  }

  Future<void> _suspenderUsuario(String documento) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("¿Estás seguro?"),
        content: const Text(
            "Este usuario será suspendido y no podrá iniciar sesión."),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text("Cancelar"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text("Sí, suspender"),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    try {
      final response =
          await http.put(Uri.parse("$apiUrl/usuario/Suspender/$documento"));

      if (response.statusCode == 200) {
        setState(() {
          usuarios.removeWhere((u) => u["n_documento"].toString() == documento);
        });

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Usuario suspendido exitosamente")),
        );
      } else {
        throw Exception("Error al suspender usuario");
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Gestión de Usuarios")),
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
        title: const Text("Gestión de Usuarios"),
        backgroundColor: Colors.red,
      ),
      body: usuarios.isEmpty
          ? const Center(
              child: Text(
                "No hay usuarios registrados actualmente.",
                style: TextStyle(fontSize: 18, color: Colors.grey),
              ),
            )
          : ListView.builder(
              itemCount: usuarios.length,
              itemBuilder: (context, index) {
                final u = usuarios[index];
                return Card(
                  margin:
                      const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  child: ListTile(
                    title: Text(u["nombre"] ?? ""),
                    subtitle: Text(
                        "${u["tipo_documento"]} - ${u["n_documento"]}\n${u["correoelectronico"]}"),
                    isThreeLine: true,
                    trailing: IconButton(
                      icon: const Icon(Icons.lock_outline, color: Colors.red),
                      onPressed: () =>
                          _suspenderUsuario(u["n_documento"].toString()),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.red,
        onPressed: () {
          // Aquí luego hacemos la vista de crear usuario
        },
        child: const Icon(Icons.person_add),
      ),
    );
  }
}
