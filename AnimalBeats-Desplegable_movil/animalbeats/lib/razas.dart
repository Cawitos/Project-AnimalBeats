// lib/features/razas.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'menu.dart';

const String baseUrl = "https://animalbeats-backend-production.up.railway.app";
const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const Color gris = Color(0xFFE6E8E6);
const Color negro = Color(0xFF07090F);

class RazasPage extends StatefulWidget {
  final int userRole;
  final String? nDocumento;
  final int especieId;

  const RazasPage({
    Key? key,
    required this.userRole,
    this.nDocumento,
    required this.especieId,
  }) : super(key: key);

  @override
  State<RazasPage> createState() => _RazasPageState();
}

class _RazasPageState extends State<RazasPage> {
  List<dynamic> razas = [];
  bool cargando = true;

  final TextEditingController _nombreController = TextEditingController();
  final TextEditingController _descController = TextEditingController();
  File? _imagen;
  int? _editId;
  String? _imagenExistente;

  @override
  void initState() {
    super.initState();
    _cargarRazas();
  }

  Future<void> _cargarRazas() async {
    setState(() => cargando = true);
    try {
      final res =
          await http.get(Uri.parse("$baseUrl/Razas/Listado/${widget.especieId}"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          razas = data is List ? data : [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar razas: $e");
    }
    setState(() => cargando = false);
  }

  Future<void> _guardarRaza() async {
    if (_nombreController.text.isEmpty) return;

    try {
      if (_editId == null) {
        // Crear raza
        final request = http.MultipartRequest(
          "POST",
          Uri.parse("$baseUrl/Razas/Crear/${widget.especieId}"),
        );
        request.fields["raza"] = _nombreController.text;
        request.fields["descripcion"] = _descController.text;

        if (_imagen != null) {
          request.files.add(
            await http.MultipartFile.fromPath("imagen", _imagen!.path),
          );
        }

        final res = await request.send();
        if (res.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Raza creada correctamente")),
          );
        }
      } else {
        // Editar raza
        final request = http.MultipartRequest(
          "PUT",
          Uri.parse("$baseUrl/Razas/Actualizar/$_editId"),
        );
        request.fields["raza"] = _nombreController.text;
        request.fields["descripcion"] = _descController.text;

        if (_imagen != null) {
          request.files.add(
            await http.MultipartFile.fromPath("imagen", _imagen!.path),
          );
        }

        final res = await request.send();
        if (res.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Raza actualizada correctamente")),
          );
        }
      }

      _nombreController.clear();
      _descController.clear();
      setState(() {
        _imagen = null;
        _editId = null;
        _imagenExistente = null;
      });
      _cargarRazas();
    } catch (e) {
      debugPrint("Error: $e");
    }
  }

  Future<void> _eliminarRaza(int id) async {
    try {
      final res = await http.delete(Uri.parse("$baseUrl/Razas/Eliminar/$id"));
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Raza eliminada correctamente")),
        );
        _cargarRazas();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error al eliminar raza")),
        );
      }
    } catch (e) {
      debugPrint("Error al eliminar: $e");
    }
  }

  void _abrirDialogo({Map<String, dynamic>? raza}) {
    if (raza != null) {
      _editId = raza["id"];
      _nombreController.text = raza["raza"] ?? "";
      _descController.text = raza["descripcion"] ?? "";
      _imagenExistente = raza["imagen"];
      _imagen = null;
    } else {
      _editId = null;
      _nombreController.clear();
      _descController.clear();
      _imagenExistente = null;
      _imagen = null;
    }

    showDialog(
      context: context,
      builder: (_) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: Text(_editId == null ? "Nueva raza" : "Editar raza"),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: _nombreController,
                    decoration: const InputDecoration(
                      labelText: "Nombre de la raza",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),
                  TextField(
                    controller: _descController,
                    decoration: const InputDecoration(
                      labelText: "Descripción",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),

                  if (_imagen != null)
                    Image.file(_imagen!, height: 120)
                  else if (_imagenExistente != null)
                    Image.network(
                      "$baseUrl/imagenes_razas/$_imagenExistente",
                      height: 120,
                    ),

                  TextButton.icon(
                    onPressed: () async {
                      final picker = ImagePicker();
                      final pickedFile =
                          await picker.pickImage(source: ImageSource.gallery);
                      if (pickedFile != null) {
                        setStateDialog(() {
                          _imagen = File(pickedFile.path);
                          _imagenExistente = null;
                        });
                      }
                    },
                    icon: const Icon(Icons.image, color: rojo),
                    label: const Text("Seleccionar imagen",
                        style: TextStyle(color: rojo)),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text("Cancelar", style: TextStyle(color: negro)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: rojo),
                  onPressed: () {
                    _guardarRaza();
                    Navigator.pop(context);
                  },
                  child: const Text("Guardar", style: TextStyle(color: blanco)),
                ),
              ],
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      drawer: OffcanvasMenu(
        userRole: widget.userRole,
        nDocumento: widget.nDocumento,
      ),
      backgroundColor: blanco,
      appBar: AppBar(
        backgroundColor: rojo,
        title: const Text("Razas", style: TextStyle(color: blanco)),
        centerTitle: true,
      ),
      body: cargando
          ? const Center(child: CircularProgressIndicator(color: rojo))
          : RefreshIndicator(
              color: rojo,
              onRefresh: _cargarRazas,
              child: ListView.builder(
                itemCount: razas.length,
                itemBuilder: (context, index) {
                  final raza = razas[index];
                  return Card(
                    margin:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 4,
                    child: ListTile(
                      leading: raza["imagen"] != null
                          ? CircleAvatar(
                              backgroundImage: NetworkImage(
                                "$baseUrl/imagenes_razas/${raza["imagen"]}",
                              ),
                            )
                          : const CircleAvatar(
                              backgroundColor: gris,
                              child: Icon(Icons.pets, color: negro),
                            ),
                      title: Text(
                        raza["Raza"] ?? "Sin nombre",
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, color: negro),
                      ),
                      subtitle: Text(raza["descripcion"] ?? ""),
                      trailing: PopupMenuButton<String>(
                        onSelected: (value) {
                          if (value == "editar") {
                            _abrirDialogo(raza: raza);
                          } else if (value == "eliminar") {
                            _eliminarRaza(raza["id"]);
                          }
                        },
                        itemBuilder: (context) => [
                          const PopupMenuItem(
                            value: "editar",
                            child: Text("Editar"),
                          ),
                          const PopupMenuItem(
                            value: "eliminar",
                            child: Text("Eliminar"),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: rojo,
        onPressed: () => _abrirDialogo(),
        child: const Icon(Icons.add, color: blanco),
      ),
    );
  }
}
