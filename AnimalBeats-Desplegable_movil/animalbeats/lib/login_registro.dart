import 'package:flutter/material.dart';

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
  final TextEditingController documentoCtrl = TextEditingController();
  final TextEditingController nombreCtrl = TextEditingController();
  final TextEditingController correoCtrl = TextEditingController();
  final TextEditingController contrasenaCtrl = TextEditingController();

  List<String> tiposDocumento = ["CC", "TI", "CE", "Pasaporte"];

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
                  Text(
                    "Registro de Usuario",
                    style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
                  ),

                  SizedBox(height: 16),

                  DropdownButtonFormField<String>(
                    decoration: InputDecoration(labelText: "Tipo de Documento"),
                    value: tipoDocumento,
                    items: tiposDocumento
                        .map(
                          (doc) =>
                              DropdownMenuItem(value: doc, child: Text(doc)),
                        )
                        .toList(),
                    onChanged: (value) => setState(() => tipoDocumento = value),
                    validator: (value) =>
                        value == null ? "Selecciona un tipo" : null,
                  ),

                  TextFormField(
                    controller: documentoCtrl,
                    decoration: InputDecoration(
                      labelText: "Número de Documento",
                    ),
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
                    decoration: InputDecoration(
                      labelText: "Correo Electrónico",
                    ),
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
                    child: Text("Registrar"),
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(builder: (context) => LoginPage()),
                        );
                      }
                    },
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
                    decoration: InputDecoration(
                      labelText: "Correo Electrónico",
                    ),
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
                    onPressed: () {
                      if (_formKey.currentState!.validate()) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text("Inicio de sesión exitoso")),
                        );
                      }
                    },
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
