import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-backend-production.up.railway.app";

class ConsultarUsuarioPage extends StatefulWidget {
  final String documento;
  const ConsultarUsuarioPage({super.key, required this.documento});

  @override
  _ConsultarUsuarioPageState createState() => _ConsultarUsuarioPageState();
}

class _ConsultarUsuarioPageState extends State<ConsultarUsuarioPage> {
  Map<String, dynamic>? usuario;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchUsuario();
  }

  Future<void> _fetchUsuario() async {
    try {
      final response =
          await http.get(Uri.parse("$apiUrl/usuario/${widget.documento}"));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          if (data is Map && data.containsKey("n_documento")) {
            usuario = Map<String, dynamic>.from(data); // ✅ conversión segura
          } else if (data is String && data == "Usuario no encontrado") {
            error = "Usuario no encontrado.";
          } else {
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

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Consultar Usuario")),
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
        title: Text("Usuario ${usuario!["n_documento"]}"),
        backgroundColor: Colors.red,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("📛 Nombre: ${usuario!["nombre"]}",
                    style: const TextStyle(fontSize: 18)),
                const SizedBox(height: 10),
                Text(
                  "🆔 Documento: ${usuario!["tipo_documento"]} - ${usuario!["n_documento"]}",
                  style: const TextStyle(fontSize: 18),
                ),
                const SizedBox(height: 10),
                Text("📧 Correo: ${usuario!["correoelectronico"]}",
                    style: const TextStyle(fontSize: 18)),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: ElevatedButton(
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.red,
            padding: const EdgeInsets.symmetric(vertical: 14),
          ),
          onPressed: () => Navigator.pop(context),
          child: const Text(
            "Volver",
            style: TextStyle(fontSize: 18, color: Colors.white),
          ),
        ),
      ),
    );
  }
}
