// lib/features/especies.dart
import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:http/http.dart' as http;
import 'menu.dart';
import 'razas.dart';

const String baseUrl = "https://animalbeats-backend-production.up.railway.app";
const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const Color gris = Color(0xFFE6E8E6);
const Color negro = Color(0xFF07090F);

class EspeciesPage extends StatefulWidget {
  final int userRole;
  final String? nDocumento;

  const EspeciesPage({Key? key, required this.userRole, this.nDocumento})
      : super(key: key);

  @override
  State<EspeciesPage> createState() => _EspeciesPageState();
}

class _EspeciesPageState extends State<EspeciesPage> {
  List<dynamic> especies = [];
  bool cargando = true;

  final TextEditingController _nombreController = TextEditingController();
  File? _imagen;
  int? _editId;
  String? _imagenExistente; 

  @override
  void initState() {
    super.initState();
    _cargarEspecies();
  }

  Future<void> _cargarEspecies() async {
    setState(() => cargando = true);
    try {
      final res = await http.get(Uri.parse("$baseUrl/Especies/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          especies = data is List ? data : [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar especies: $e");
    }
    setState(() => cargando = false);
  }

  Future<void> _guardarEspecie() async {
    if (_nombreController.text.isEmpty) return;

    try {
      if (_editId == null) {
        // Crear especie
        final request =
            http.MultipartRequest("POST", Uri.parse("$baseUrl/Especies/Crear"));
        request.fields["Especie"] = _nombreController.text;

        if (_imagen != null) {
          request.files.add(
            await http.MultipartFile.fromPath("imagen", _imagen!.path),
          );
        }

        final res = await request.send();
        if (res.statusCode == 201) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Especie creada correctamente")),
          );
        }
      } else {
        // Actualizar especie
        final request = http.MultipartRequest(
          "PUT",
          Uri.parse("$baseUrl/Especies/Actualizar/$_editId"),
        );
        request.fields["Especie"] = _nombreController.text;

        if (_imagen != null) {
          request.files.add(
            await http.MultipartFile.fromPath("imagen", _imagen!.path),
          );
        }

        final res = await request.send();
        if (res.statusCode == 200) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Especie actualizada correctamente")),
          );
        }
      }

      _nombreController.clear();
      setState(() {
        _imagen = null;
        _editId = null;
        _imagenExistente = null;
      });
      _cargarEspecies();
    } catch (e) {
      debugPrint("Error: $e");
    }
  }

  Future<void> _eliminarEspecie(int id) async {
    try {
      final res =
          await http.delete(Uri.parse("$baseUrl/Especies/Eliminar/$id"));
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Especie eliminada correctamente")),
        );
        _cargarEspecies();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error al eliminar especie")),
        );
      }
    } catch (e) {
      debugPrint("Error al eliminar: $e");
    }
  }

  void _abrirDialogo({Map<String, dynamic>? especie}) {
    if (especie != null) {
      _editId = especie["id"];
      _nombreController.text = especie["Especie"] ?? "";
      _imagenExistente = especie["imagen"]; 
      _imagen = null; // para que no se confunda con imagen nueva
    } else {
      _editId = null;
      _nombreController.clear();
      _imagenExistente = null;
      _imagen = null;
    }

    showDialog(
      context: context,
      builder: (_) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: Text(_editId == null ? "Nueva especie" : "Editar especie"),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextField(
                    controller: _nombreController,
                    decoration: const InputDecoration(
                      labelText: "Nombre de la especie",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 10),

                  // 👇 Mostrar imagen existente o la nueva seleccionada
                  if (_imagen != null)
                    Image.file(_imagen!, height: 120)
                  else if (_imagenExistente != null)
                    Image.network(
                      "$baseUrl/imagenes_especies/$_imagenExistente",
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
                          _imagenExistente = null; // reemplaza la anterior
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
                    _guardarEspecie();
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
        title: const Text("Especies", style: TextStyle(color: blanco)),
        centerTitle: true,
      ),
      body: cargando
          ? const Center(child: CircularProgressIndicator(color: rojo))
          : RefreshIndicator(
              color: rojo,
              onRefresh: _cargarEspecies,
              child: ListView.builder(
                itemCount: especies.length,
                itemBuilder: (context, index) {
                  final especie = especies[index];
                  return Card(
                    margin:
                        const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 4,
                    child: ListTile(
                      leading: especie["imagen"] != null
                          ? CircleAvatar(
                              backgroundImage: NetworkImage(
                                "$baseUrl/imagenes_especies/${especie["imagen"]}",
                              ),
                            )
                          : const CircleAvatar(
                              backgroundColor: gris,
                              child: Icon(Icons.pets, color: negro),
                            ),
                      title: Text(
                        especie["Especie"] ?? "Sin nombre",
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, color: negro),
                      ),
                      onTap: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (_) => RazasPage(
                              userRole: widget.userRole,
                              nDocumento: widget.nDocumento,
                              especieId: especie["id"],
                            ),
                          ),
                        );
                      },
                      trailing: PopupMenuButton<String>(
                        onSelected: (value) {
                          if (value == "editar") {
                            _abrirDialogo(especie: especie);
                          } else if (value == "eliminar") {
                            _eliminarEspecie(especie["id"]);
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
