// lib/features/gestion_enfermedades.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'menu.dart';

const String baseUrl = "https://animalbeats-api.onrender.com/Enfermedades";
const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const Color gris = Color(0xFF6C757D);
const Color negro = Color(0xFF07090F);

class GestionEnfermedadesPage extends StatefulWidget {
  final int userRole;
  final String? nDocumento;

  const GestionEnfermedadesPage({
    Key? key,
    required this.userRole,
    this.nDocumento,
  }) : super(key: key);

  @override
  State<GestionEnfermedadesPage> createState() =>
      _GestionEnfermedadesPageState();
}

class _GestionEnfermedadesPageState extends State<GestionEnfermedadesPage> {
  List<dynamic> enfermedades = [];
  List<dynamic> enfermedadesFiltradas = [];
  bool cargando = true;

  final TextEditingController _nombreController = TextEditingController();
  final TextEditingController _descripcionController = TextEditingController();
  final TextEditingController _busquedaController = TextEditingController();

  int? _editId;

  @override
  void initState() {
    super.initState();
    _cargarEnfermedades();
  }

  Future<void> _cargarEnfermedades() async {
    setState(() => cargando = true);
    try {
      final res = await http.get(Uri.parse("$baseUrl/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is List) {
          setState(() {
            enfermedades = data;
            enfermedadesFiltradas = data;
          });
        }
      }
    } catch (e) {
      debugPrint("Error al cargar enfermedades: $e");
    }
    setState(() => cargando = false);
  }

  void _filtrarEnfermedades(String query) {
    setState(() {
      enfermedadesFiltradas = enfermedades.where((e) {
        final nombre = (e['nombre'] ?? "").toLowerCase();
        final descripcion = (e['descripcion'] ?? "").toLowerCase();
        return nombre.contains(query.toLowerCase()) ||
            descripcion.contains(query.toLowerCase());
      }).toList();
    });
  }

  Future<void> _guardarEnfermedad() async {
    if (_nombreController.text.isEmpty || _descripcionController.text.isEmpty) {
      _mostrarDialogo("Atención", "Todos los campos son obligatorios");
      return;
    }

    final body = json.encode({
      'nombre': _nombreController.text,
      'descripcion': _descripcionController.text,
    });

    try {
      final url = _editId == null
          ? "$baseUrl/Registrar"
          : "$baseUrl/Actualizar/$_editId";

      final response = _editId == null
          ? await http.post(Uri.parse(url),
              headers: {'Content-Type': 'application/json'}, body: body)
          : await http.put(Uri.parse(url),
              headers: {'Content-Type': 'application/json'}, body: body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        _mostrarDialogo(
          "Éxito",
          _editId == null
              ? "Enfermedad registrada correctamente"
              : "Enfermedad actualizada correctamente",
        );
        _limpiarFormulario();
        _cargarEnfermedades();
      } else {
        _mostrarDialogo("Error", "No se pudo guardar la enfermedad");
      }
    } catch (e) {
      debugPrint("Error: $e");
      _mostrarDialogo("Error", "No se pudo guardar la enfermedad");
    }
  }

  Future<void> _eliminarEnfermedad(int id) async {
    final confirmar = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text("¿Eliminar enfermedad?"),
        content: const Text("Esta acción no se puede deshacer"),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text("Cancelar")),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: rojo),
            onPressed: () => Navigator.pop(context, true),
            child: const Text("Eliminar"),
          ),
        ],
      ),
    );

    if (confirmar != true) return;

    try {
      final res = await http.delete(Uri.parse("$baseUrl/Eliminar/$id"));
      if (res.statusCode == 200) {
        _mostrarDialogo("Éxito", "Enfermedad eliminada correctamente");
        _cargarEnfermedades();
      } else {
        _mostrarDialogo("Error", "No se pudo eliminar la enfermedad");
      }
    } catch (e) {
      debugPrint("Error al eliminar: $e");
      _mostrarDialogo("Error", "No se pudo eliminar la enfermedad");
    }
  }

  void _mostrarDialogo(String titulo, String mensaje) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(titulo),
        content: Text(mensaje),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cerrar"),
          ),
        ],
      ),
    );
  }

  void _limpiarFormulario() {
    setState(() {
      _editId = null;
      _nombreController.clear();
      _descripcionController.clear();
    });
  }

  void _abrirFormulario({Map<String, dynamic>? enfermedad}) {
    if (enfermedad != null) {
      _editId = enfermedad['id'];
      _nombreController.text = enfermedad['nombre'] ?? "";
      _descripcionController.text = enfermedad['descripcion'] ?? "";
    } else {
      _limpiarFormulario();
    }

    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text(_editId == null
            ? "Registrar Enfermedad"
            : "Editar Enfermedad"),
        content: SingleChildScrollView(
          child: Column(
            children: [
              TextField(
                controller: _nombreController,
                decoration: const InputDecoration(
                  labelText: "Nombre",
                  border: OutlineInputBorder(),
                ),
                readOnly: _editId != null,
              ),
              const SizedBox(height: 12),
              TextField(
                controller: _descripcionController,
                decoration: const InputDecoration(
                  labelText: "Descripción",
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text("Cancelar"),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: rojo),
            onPressed: () {
              _guardarEnfermedad();
              Navigator.pop(context);
            },
            child: const Text("Guardar", style: TextStyle(color: blanco)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final puedeEditar = widget.userRole == 1 || widget.userRole == 3;

    return Scaffold(
      drawer: OffcanvasMenu(
        userRole: widget.userRole,
        nDocumento: widget.nDocumento,
      ),
      appBar: AppBar(
        backgroundColor: rojo,
        title: const Text("Gestión de Enfermedades",
            style: TextStyle(color: blanco)),
        centerTitle: true,
      ),
      backgroundColor: blanco,
      body: cargando
          ? const Center(child: CircularProgressIndicator(color: rojo))
          : RefreshIndicator(
              color: rojo,
              onRefresh: _cargarEnfermedades,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  // Campo búsqueda
                  TextField(
                    controller: _busquedaController,
                    decoration: const InputDecoration(
                      hintText: "Buscar enfermedades...",
                      prefixIcon: Icon(Icons.search),
                      border: OutlineInputBorder(),
                    ),
                    onChanged: _filtrarEnfermedades,
                  ),
                  const SizedBox(height: 16),

                  Text("Listado de Enfermedades",
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),

                  const SizedBox(height: 12),

                  enfermedadesFiltradas.isEmpty
                      ? const Center(
                          child: Text("No hay enfermedades registradas"))
                      : Column(
                          children: enfermedadesFiltradas.map((e) {
                            return Card(
                              elevation: 4,
                              margin: const EdgeInsets.symmetric(vertical: 6),
                              child: ListTile(
                                title: Text(e["nombre"] ?? "Sin nombre",
                                    style: const TextStyle(
                                        fontWeight: FontWeight.bold)),
                                subtitle: Text(
                                    e["descripcion"] ?? "Sin descripción"),
                                onTap: () => _mostrarDialogo(
                                    e["nombre"], e["descripcion"] ?? ""),
                                trailing: puedeEditar
                                    ? Wrap(
                                        children: [
                                          IconButton(
                                            icon: const Icon(Icons.edit,
                                                color: Colors.blue),
                                            onPressed: () =>
                                                _abrirFormulario(enfermedad: e),
                                          ),
                                          IconButton(
                                            icon: const Icon(Icons.delete,
                                                color: Colors.red),
                                            onPressed: () =>
                                                _eliminarEnfermedad(e["id"]),
                                          ),
                                        ],
                                      )
                                    : null,
                              ),
                            );
                          }).toList(),
                        ),
                ],
              ),
            ),
      floatingActionButton: puedeEditar
          ? FloatingActionButton(
              backgroundColor: rojo,
              onPressed: () => _abrirFormulario(),
              child: const Icon(Icons.add, color: blanco),
            )
          : null,
    );
  }
}
