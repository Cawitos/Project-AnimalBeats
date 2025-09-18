import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'consultar_usuario.dart';
import 'crear_usuario.dart';
import 'modificar_usuario.dart';

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
        print("Respuesta JSON: $data"); 

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

  Future<void> _cambiarEstadoUsuario(
    String documento, String estadoActual) async {
  final accion = estadoActual == "Activo" ? "Suspender" : "Reactivar";
  final nuevoEstado = estadoActual == "Activo" ? "Suspendido" : "Activo";

  final confirmar = await showDialog<bool>(
    context: context,
    builder: (ctx) => AlertDialog(
      title: Text("¿Estás seguro?"),
      content: Text("Este usuario será $accion."),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(ctx, false),
          child: const Text("Cancelar"),
        ),
        ElevatedButton(
          style: ElevatedButton.styleFrom(
              backgroundColor:
                  estadoActual == "Activo" ? Colors.red : Colors.green),
          onPressed: () => Navigator.pop(ctx, true),
          child: Text("Sí, $accion"),
        ),
      ],
    ),
  );

  if (confirmar != true) return;

  try {
    final endpoint = estadoActual == "Activo"
        ? "$apiUrl/usuario/Suspender/$documento"
        : "$apiUrl/usuario/Reactivar/$documento";

    final response = await http.put(Uri.parse(endpoint));

    if (response.statusCode == 200) {
      setState(() {
        usuarios = usuarios.map((u) {
          if (u["n_documento"].toString() == documento) {
            u["estado"] = nuevoEstado;
          }
          return u;
        }).toList();
      });

      final mensaje = estadoActual == "Activo"
          ? "Usuario suspendido correctamente"
          : "Usuario reactivado correctamente";

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(mensaje)),
      );
    } else {
      throw Exception("Error al $accion usuario");
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
                      "${u["tipo_documento"]} - ${u["n_documento"]}\n${u["correoelectronico"]}\nEstado: ${u["estado"]}",
                    ),
                    isThreeLine: true,
                    trailing: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // 👁 Botón consultar
                        IconButton(
                          icon: const Icon(Icons.remove_red_eye,
                              color: Colors.blue),
                          onPressed: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => ConsultarUsuarioPage(
                                    documento: u["n_documento"].toString()),
                              ),
                            );
                          },
                        ),

                        // ✏️ Botón actualizar
                        IconButton(
                          icon: const Icon(Icons.edit, color: Colors.orange),
                          onPressed: () async {
                            final actualizado = await Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    ModificarUsuarioPage(usuario: u),
                              ),
                            );

                            if (actualizado == true) {
                              _fetchUsuarios(); // recarga la lista al volver
                            }
                          },
                        ),
                        // 🔒 Botón suspender/reactivar
                        IconButton(
                          icon: Icon(
                            u["estado"] == "Activo"
                                ? Icons.lock_outline
                                : Icons.lock_open,
                            color: u["estado"] == "Activo"
                                ? Colors.red
                                : Colors.green,
                          ),
                          onPressed: () => _cambiarEstadoUsuario(
                            u["n_documento"].toString(),
                            u["estado"],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: Colors.red,
        onPressed: () async {
          final result = await Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const CrearUsuarioPage()),
          );

          if (result == true) {
            _fetchUsuarios(); // 👈 refresca la lista al volver
          }
        },
        child: const Icon(Icons.person_add),
      ),
    );
  }
}
