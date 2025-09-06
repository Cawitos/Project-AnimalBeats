import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'admin.dart';

// URL de tu backend en Railway
const String apiUrl = "https://animalbeats-backend-production.up.railway.app";

void main() {
  runApp(AnimalBeatsApp());
}

class AnimalBeatsApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "AnimalBeats",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.red),
      home: RegistroPage(), // <- Primera pantalla
    );
  }
}

// ---------------------- REGISTRO ----------------------
class RegistroPage extends StatefulWidget {
  @override
  _RegistroPageState createState() => _RegistroPageState();
}

class _RegistroPageState extends State<RegistroPage> {
  final _formKey = GlobalKey<FormState>();

  String? tipoDocumento;
  List<Map<String, dynamic>> tiposDocumento = [];

  final TextEditingController documentoCtrl = TextEditingController();
  final TextEditingController nombreCtrl = TextEditingController();
  final TextEditingController correoCtrl = TextEditingController();
  final TextEditingController contrasenaCtrl = TextEditingController();
  final TextEditingController confirmarContrasenaCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _cargarTiposDocumento();
  }

  Future<void> _cargarTiposDocumento() async {
    try {
      final response = await http.get(Uri.parse("$apiUrl/tiposDocumento"));
      if (response.statusCode == 200) {
        final List data = jsonDecode(response.body);
        setState(() {
          tiposDocumento = data.cast<Map<String, dynamic>>();
        });
      }
    } catch (e) {
      print("Error cargando tipos de documento: $e");
    }
  }

  Future<void> _registrarUsuario() async {
    if (!_formKey.currentState!.validate()) return;

    // Validación de confirmación de contraseña
    if (contrasenaCtrl.text != confirmarContrasenaCtrl.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Las contraseñas no coinciden")),
      );
      return;
    }

    try {
      final response = await http.post(
        Uri.parse("$apiUrl/registro"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "n_documento": documentoCtrl.text,
          "correoelectronico": correoCtrl.text,
          "contrasena": contrasenaCtrl.text,
          "id_documento": tipoDocumento,
          "nombre": nombreCtrl.text,
        }),
      );

      final data = jsonDecode(response.body);
      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Usuario registrado exitosamente")),
        );

        //Redirigir a LoginPage
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => LoginPage()),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data["mensaje"] ?? "Error en el registro")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error conectando al servidor: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Registro de Usuario")),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 4,
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  Text("Registro de Usuario",
                      style:
                          TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                  SizedBox(height: 16),

                  // Dropdown dinámico
                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(labelText: "Tipo de Documento"),
                    value: tipoDocumento,
                    items: tiposDocumento
                        .map((doc) => DropdownMenuItem(
                              value: doc["id"].toString(),
                              child: Text(doc["tipo"]),
                            ))
                        .toList(),
                    onChanged: (value) => setState(() => tipoDocumento = value),
                    validator: (value) =>
                        value == null ? "Selecciona un tipo" : null,
                  ),

                  TextFormField(
                    controller: documentoCtrl,
                    decoration:
                        InputDecoration(labelText: "Número de Documento"),
                    keyboardType: TextInputType.number,
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),

                  TextFormField(
                    controller: nombreCtrl,
                    decoration: InputDecoration(labelText: "Nombre Completo"),
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),

                  TextFormField(
                    controller: correoCtrl,
                    decoration:
                        InputDecoration(labelText: "Correo Electrónico"),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),

                  TextFormField(
                    controller: contrasenaCtrl,
                    decoration: InputDecoration(labelText: "Contraseña"),
                    obscureText: true,
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),

                  TextFormField(
                    controller: confirmarContrasenaCtrl,
                    decoration:
                        InputDecoration(labelText: "Confirmar Contraseña"),
                    obscureText: true,
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),

                  SizedBox(height: 20),

                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                    child: Text("Registrar"),
                    onPressed: _registrarUsuario,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------- LOGIN ----------------------
class LoginPage extends StatefulWidget {
  @override
  _LoginPageState createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final TextEditingController correoCtrl = TextEditingController();
  final TextEditingController contrasenaCtrl = TextEditingController();

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      final response = await http.post(
        Uri.parse("$apiUrl/login"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({
          "correoelectronico": correoCtrl.text,
          "contrasena": contrasenaCtrl.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Bienvenido ${data['usuario']['nombre']}")),
        );

        // Aquí podrías guardar el token en memoria segura (ej: shared_preferences)
        // y redirigir al Home o Dashboard:
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => const AdminDashboard()),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(data["mensaje"] ?? "Error al iniciar sesión")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Error de conexión con el servidor: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Iniciar Sesión")),
      body: Padding(
        padding: EdgeInsets.all(16.0),
        child: Card(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          elevation: 4,
          child: Padding(
            padding: EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: ListView(
                children: [
                  Text(
                    "Iniciar Sesión",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  SizedBox(height: 16),
                  TextFormField(
                    controller: correoCtrl,
                    decoration:
                        InputDecoration(labelText: "Correo Electrónico"),
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),
                  TextFormField(
                    controller: contrasenaCtrl,
                    decoration: InputDecoration(labelText: "Contraseña"),
                    obscureText: true,
                    validator: (value) =>
                        value!.isEmpty ? "Campo requerido" : null,
                  ),
                  SizedBox(height: 20),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      foregroundColor: Colors.white,
                    ),
                    child: Text("Iniciar Sesión"),
                    onPressed: _login,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
