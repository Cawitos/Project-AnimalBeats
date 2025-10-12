import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

const String apiUrl = "https://animalbeats-api.onrender.com";

class CrearUsuarioPage extends StatefulWidget {
  const CrearUsuarioPage({super.key});

  @override
  _CrearUsuarioPageState createState() => _CrearUsuarioPageState();
}

class _CrearUsuarioPageState extends State<CrearUsuarioPage> {
  final _formKey = GlobalKey<FormState>();
  List<dynamic> roles = [];
  List<dynamic> tiposDocumento = [];

  String? idDocumento;
  String? nDocumento;
  String? nombre;
  String? correo;
  String? contrasena;
  String? idRol;

  bool loading = false;

  @override
  void initState() {
    super.initState();
    _fetchTiposDocumento();
    _fetchRoles();
  }

  Future<void> _fetchTiposDocumento() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/tiposDocumento"));
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        if (data is List) {
          setState(() => tiposDocumento = data);
        }
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

  Future<void> _crearUsuario() async {
    if (!_formKey.currentState!.validate()) return;

    _formKey.currentState!.save();

    //Valida si rol es admin pero correo no es el predeterminado
    if (idRol == "1" &&
        correo?.toLowerCase() != "administrador@animalbeats.com") {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text(
                " Solo se permite el correo predeterminado para rol Administrador")),
      );
      return;
    }

    setState(() => loading = true);

    final body = {
      "id_documento": idDocumento,
      "n_documento": nDocumento,
      "nombre": nombre,
      "correoelectronico": correo,
      "contrasena": contrasena,
      "id_rol": idRol,
    };

    try {
      final response = await http.post(
        Uri.parse("$apiUrl/usuario/Crear"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("✅ Usuario creado correctamente")),
        );
        Navigator.pop(context, true);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("❌ Error: ${response.body}")),
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
        title: const Text(
          "Crear Usuario",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.red,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
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
              TextFormField(
                decoration:
                    const InputDecoration(labelText: "Número de documento"),
                keyboardType: TextInputType.number,
                onSaved: (val) => nDocumento = val,
                validator: (val) =>
                    val == null || val.isEmpty ? "Campo obligatorio" : null,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: "Nombre completo"),
                onSaved: (val) => nombre = val,
                validator: (val) =>
                    val == null || val.isEmpty ? "Campo obligatorio" : null,
              ),
              TextFormField(
                decoration:
                    const InputDecoration(labelText: "Correo electrónico"),
                keyboardType: TextInputType.emailAddress,
                onSaved: (val) => correo = val,
                validator: (val) => val == null || !val.contains("@")
                    ? "Correo inválido"
                    : null,
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: "Contraseña"),
                obscureText: true,
                onSaved: (val) => contrasena = val,
                validator: (val) => val == null || val.length < 6
                    ? "Mínimo 6 caracteres"
                    : null,
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
                onPressed: loading ? null : _crearUsuario,
                child: loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Registrar Usuario",
                        style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
