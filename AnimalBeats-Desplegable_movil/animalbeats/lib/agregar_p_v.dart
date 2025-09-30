import 'dart:io' show File;
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart' show kIsWeb;

class AgregarVeterinarioPage extends StatefulWidget {
  const AgregarVeterinarioPage({super.key});

  @override
  State<AgregarVeterinarioPage> createState() => _AgregarVeterinarioPageState();
}

class _AgregarVeterinarioPageState extends State<AgregarVeterinarioPage> {
  final _formKey = GlobalKey<FormState>();

  final TextEditingController nombreController = TextEditingController();
  final TextEditingController estudiosController = TextEditingController();
  final TextEditingController edadController = TextEditingController();
  final TextEditingController alturaController = TextEditingController();
  final TextEditingController experienciaController = TextEditingController();

  XFile? imagenSeleccionada;

  Future<void> _seleccionarImagen() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(source: ImageSource.gallery);

    if (pickedFile != null) {
      setState(() {
        imagenSeleccionada = pickedFile;
      });
    }
  }

  Future<void> _guardarVeterinario() async {
    if (!_formKey.currentState!.validate()) return;

    final uri = Uri.parse(
        "https://animalbeats-api.onrender.com/veterinarios");

    var request = http.MultipartRequest('POST', uri);

    request.fields['nombre_completo'] = nombreController.text;
    request.fields['estudios_especialidad'] = estudiosController.text;
    request.fields['edad'] = edadController.text;
    request.fields['altura'] = alturaController.text;
    request.fields['anios_experiencia'] = experienciaController.text;

    if (imagenSeleccionada != null && !kIsWeb) {
      request.files.add(await http.MultipartFile.fromPath(
        'imagen',
        imagenSeleccionada!.path,
      ));
    } else if (imagenSeleccionada != null && kIsWeb) {
      final bytes = await imagenSeleccionada!.readAsBytes();
      request.files.add(http.MultipartFile.fromBytes(
        'imagen',
        bytes,
        filename: imagenSeleccionada!.name,
      ));
    }

    try {
      final streamedResponse = await request.send();
      final response = await http.Response.fromStream(streamedResponse);

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Veterinario creado correctamente")),
        );
        Navigator.pop(context, true);
      } else {
        print("❌ Error ${response.statusCode}: ${response.body}");
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${response.body}")),
        );
      }
    } catch (e) {
      print("🔥 Excepción en _guardarVeterinario: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error al conectar con el servidor")),
      );
    }
  }

 Widget _mostrarImagen() {
  if (imagenSeleccionada == null) {
    return const SizedBox.shrink();
  }

  if (kIsWeb) {
    return FutureBuilder(
      future: imagenSeleccionada!.readAsBytes(),
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.done &&
            snapshot.hasData) {
          return Image.memory(
            snapshot.data!,
            height: 150,
            fit: BoxFit.cover,
          );
        } else {
          return const CircularProgressIndicator();
        }
      },
    );
  } else {
    return Image.file(
      File(imagenSeleccionada!.path),
      height: 150,
      fit: BoxFit.cover,
    );
  }
}

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Agregar Veterinario"),
        backgroundColor: Colors.red, 
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: nombreController,
                decoration: const InputDecoration(labelText: "Nombre Completo"),
                validator: (value) =>
                    value!.isEmpty ? "Ingrese el nombre" : null,
              ),
              TextFormField(
                controller: estudiosController,
                decoration:
                    const InputDecoration(labelText: "Estudios o Especialidad"),
                validator: (value) =>
                    value!.isEmpty ? "Ingrese los estudios" : null,
              ),
              TextFormField(
                controller: edadController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: "Edad"),
                validator: (value) => value!.isEmpty ? "Ingrese la edad" : null,
              ),
              TextFormField(
                controller: alturaController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(labelText: "Altura (m)"),
                validator: (value) =>
                    value!.isEmpty ? "Ingrese la altura" : null,
              ),
              TextFormField(
                controller: experienciaController,
                keyboardType: TextInputType.number,
                decoration:
                    const InputDecoration(labelText: "Años de experiencia"),
                validator: (value) =>
                    value!.isEmpty ? "Ingrese los años de experiencia" : null,
              ),
              const SizedBox(height: 20),
              _mostrarImagen(),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red, 
                  foregroundColor: Colors.white, 
                ),
                onPressed: _seleccionarImagen,
                child: const Text("Seleccionar Imagen"),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red, 
                  foregroundColor: Colors.white, 
                ),
                onPressed: _guardarVeterinario,
                child: const Text("Guardar"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
