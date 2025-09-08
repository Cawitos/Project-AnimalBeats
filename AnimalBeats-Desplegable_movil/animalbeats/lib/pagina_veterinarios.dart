import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'agregar_p_v.dart';

class VeterinariosPage extends StatefulWidget {
  const VeterinariosPage({super.key});

  @override
  State<VeterinariosPage> createState() => _VeterinariosPageState();
}

class _VeterinariosPageState extends State<VeterinariosPage> {
  bool mostrarAviso = true;
  List<dynamic> veterinarios = [];

  final String baseUrl =
      "https://animalbeats-backend-production.up.railway.app";

  @override
  void initState() {
    super.initState();
    _cargarVeterinarios();
  }

  Future<void> _cargarVeterinarios() async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/veterinarios"));
      if (response.statusCode == 200) {
        setState(() {
          veterinarios = json.decode(response.body);
        });
      }
    } catch (e) {
      print("Error cargando veterinarios: $e");
    }
  }

  Future<void> _eliminarVeterinario(int id) async {
    try {
      final response =
          await http.delete(Uri.parse("$baseUrl/veterinarios/$id"));
      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Veterinario eliminado")),
        );
        _cargarVeterinarios();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error al eliminar veterinario")),
        );
      }
    } catch (e) {
      print("Error eliminando veterinario: $e");
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Veterinarios")),
      body: mostrarAviso ? _buildAviso() : _buildListaVeterinarios(),
      floatingActionButton: mostrarAviso
          ? null
          : FloatingActionButton(
              backgroundColor: Colors.red,
              onPressed: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (context) => const AgregarVeterinarioPage()),
                );
                if (result == true) {
                  _cargarVeterinarios();
                }
              },
              child: const Icon(Icons.add),
            ),
    );
  }

  Widget _buildAviso() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              "Bienvenido Veterinario",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            const Text(
              "Presiona el botón de continuar, selecciona la opción agregar y rellena los datos que te pide el formulario.",
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                setState(() {
                  mostrarAviso = false;
                  _cargarVeterinarios();
                });
              },
              child: const Text("Continuar"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildListaVeterinarios() {
    if (veterinarios.isEmpty) {
      return const Center(
        child: Text(
          "Aquí se mostrarán los perfiles de los veterinarios",
          style: TextStyle(color: Colors.black54),
        ),
      );
    }

    return ListView.builder(
      itemCount: veterinarios.length,
      itemBuilder: (context, index) {
        final vet = veterinarios[index];
        return Card(
          margin: const EdgeInsets.all(10),
          child: ListTile(
            leading: vet["imagen_url"] != null
                ? Image.network(vet["imagen_url"],
                    width: 50, height: 50, fit: BoxFit.cover)
                : const Icon(Icons.person, size: 50),
            title: Text(vet["nombre_completo"]),
            subtitle: Text("Especialidad: ${vet["estudios_especialidad"]}"),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                IconButton(
                  icon: const Icon(Icons.remove_red_eye, color: Colors.blue),
                  onPressed: () {
                    _mostrarDetalle(vet);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () {
                    _eliminarVeterinario(vet["id_veterinario"]);
                  },
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  void _mostrarDetalle(dynamic vet) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(vet["nombre_completo"]),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                vet["imagen_url"] != null
                    ? Image.network(vet["imagen_url"], height: 150)
                    : const Icon(Icons.person, size: 100),
                const SizedBox(height: 10),
                Text("Estudios: ${vet["estudios_especialidad"]}"),
                Text("Edad: ${vet["edad"]}"),
                Text("Altura: ${vet["altura"]} m"),
                Text("Experiencia: ${vet["anios_experiencia"]} años"),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cerrar"),
            ),
          ],
        );
      },
    );
  }
}
