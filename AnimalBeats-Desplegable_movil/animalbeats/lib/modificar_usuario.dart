import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-backend-production.up.railway.app";

class ModificarUsuarioPage extends StatefulWidget {
  final Map<String, dynamic> usuario;

  const ModificarUsuarioPage({super.key, required this.usuario});

  @override
  _ModificarUsuarioPageState createState() => _ModificarUsuarioPageState();
}

class _ModificarUsuarioPageState extends State<ModificarUsuarioPage> {
  final _formKey = GlobalKey<FormState>();
  bool loading = false;

  List<dynamic> tiposDocumento = [];
  List<dynamic> roles = [];

  String? nDocumento;
  String? nDocumentoOriginal;
  String? nombre;
  String? correo;
  String? idDocumento;
  String? idRol;

  @override
  void initState() {
    super.initState();
    _fetchTiposDocumento();
    _fetchRoles();

    // Pre-cargar datos del usuario
    final u = widget.usuario;
    nDocumento = u["n_documento"]?.toString();
    nDocumentoOriginal = u["n_documento"]?.toString();
    nombre = u["nombre"];
    correo = u["correoelectronico"];
    idDocumento = u["id_documento"]?.toString();
    idRol = u["id_rol"]?.toString();
  }

  Future<void> _fetchTiposDocumento() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/tiposDocumento"));
      if (response.statusCode == 200) {
        setState(() => tiposDocumento = jsonDecode(response.body));
      }
    } catch (e) {
      debugPrint("Error al obtener tipos de documento: $e");
    }
  }

  Future<void> _fetchRoles() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/roles/Listado"));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is Map && data.containsKey("roles")) {
          setState(() => roles = data["roles"]);
        }
      }
    } catch (e) {
      debugPrint("Error al obtener roles: $e");
    }
  }

  Future<void> _modificarUsuario() async {
    if (!_formKey.currentState!.validate()) return;

    _formKey.currentState!.save();
    setState(() => loading = true);

    final body = {
      "nombre": nombre,
      "correoelectronico": correo,
      "id_documento": idDocumento,
      "id_rol": idRol,
      "n_documento_original": nDocumentoOriginal,
    };

    try {
      final response = await http.put(
        Uri.parse("$apiUrl/usuario/Actualizar/$nDocumento"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("✅ ${data['mensaje']}")),
        );
        Navigator.pop(context, true); // volvemos indicando éxito
      } else {
        final data = jsonDecode(response.body);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text("❌ Error: ${data['error'] ?? data['mensaje']}")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("⚠️ Error de conexión: $e")),
      );
    } finally {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Modificar Usuario"),
        backgroundColor: Colors.red,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                initialValue: nDocumento,
                decoration:
                    const InputDecoration(labelText: "Número de documento"),
                keyboardType: TextInputType.number,
                onSaved: (val) => nDocumento = val,
                validator: (val) =>
                    val == null || val.isEmpty ? "Campo obligatorio" : null,
              ),
              TextFormField(
                initialValue: nombre,
                decoration: const InputDecoration(labelText: "Nombre completo"),
                onSaved: (val) => nombre = val,
                validator: (val) =>
                    val == null || val.isEmpty ? "Campo obligatorio" : null,
              ),
              TextFormField(
                initialValue: correo,
                decoration:
                    const InputDecoration(labelText: "Correo electrónico"),
                keyboardType: TextInputType.emailAddress,
                onSaved: (val) => correo = val,
                validator: (val) => val == null || !val.contains("@")
                    ? "Correo inválido"
                    : null,
              ),
              DropdownButtonFormField<String>(
                value: idDocumento,
                decoration:
                    const InputDecoration(labelText: "Tipo de documento"),
                items: tiposDocumento
                    .map((doc) => DropdownMenuItem(
                          value: doc["id"].toString(),
                          child: Text(doc["tipo"]),
                        ))
                    .toList(),
                onChanged: (val) => setState(() => idDocumento = val),
                validator: (val) => val == null ? "Seleccione un tipo" : null,
              ),
              DropdownButtonFormField<String>(
                value: idRol,
                decoration: const InputDecoration(labelText: "Rol"),
                items: roles
                    .map((rol) => DropdownMenuItem(
                          value: rol["id"].toString(),
                          child: Text(rol["rol"]),
                        ))
                    .toList(),
                onChanged: (val) => setState(() => idRol = val),
                validator: (val) => val == null ? "Seleccione un rol" : null,
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                ),
                onPressed: loading ? null : _modificarUsuario,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Guardar Cambios",
                        style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
