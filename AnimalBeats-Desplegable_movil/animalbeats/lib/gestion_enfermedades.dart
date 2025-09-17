// lib/features/gestion_enfermedades.dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'menu.dart';

const String baseUrl = "https://animalbeats-backend-production.up.railway.app";
const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const Color gris = Color(0xFFE6E8E6);
const Color negro = Color(0xFF07090F);

class GestionEnfermedadesPage extends StatefulWidget {
  final int userRole;
  final String? nDocumento;

  const GestionEnfermedadesPage({Key? key, required this.userRole, this.nDocumento})
      : super(key: key);

  @override
  State<GestionEnfermedadesPage> createState() => _GestionEnfermedadesPageState();
}

class _GestionEnfermedadesPageState extends State<GestionEnfermedadesPage> {
  List<dynamic> enfermedades = [];
  List<dynamic> mascotas = [];
  bool cargando = true;

  final TextEditingController _nombreController = TextEditingController();
  final TextEditingController _descripcionController = TextEditingController();
  final TextEditingController _fechaController = TextEditingController();
  
  String _selectedMascota = '';
  int? _editId;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
    setState(() => cargando = true);
    try {
      await _cargarMascotas();
      await _cargarEnfermedades();
    } catch (e) {
      debugPrint("Error al cargar datos: $e");
    }
    setState(() => cargando = false);
  }

  Future<void> _cargarMascotas() async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/mascotas"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          mascotas = data['mascotas'] is List ? data['mascotas'] : [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar mascotas: $e");
    }
  }

  Future<void> _cargarEnfermedades() async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/enfermedades/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          enfermedades = data is List ? data : [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar enfermedades: $e");
    }
  }

  Future<void> _guardarEnfermedad() async {
    if (_nombreController.text.isEmpty || _selectedMascota.isEmpty) {
      _mostrarSnackbar("Complete los campos obligatorios");
      return;
    }

    try {
      final url = _editId == null 
          ? "$baseUrl/enfermedades/Registrar"
          : "$baseUrl/enfermedades/Actualizar/$_editId";
          
      final body = json.encode({
        'id_Mascota': _selectedMascota,
        'nombre': _nombreController.text,
        'descripcion': _descripcionController.text,
        'fecha_diagnostico': _fechaController.text.isNotEmpty 
            ? _fechaController.text 
            : DateTime.now().toIso8601String(),
      });

      final response = _editId == null
          ? await http.post(
              Uri.parse(url),
              headers: {'Content-Type': 'application/json'},
              body: body,
            )
          : await http.put(
              Uri.parse(url),
              headers: {'Content-Type': 'application/json'},
              body: body,
            );

      if (response.statusCode == 200 || response.statusCode == 201) {
        _mostrarSnackbar(
          _editId == null 
            ? "Enfermedad registrada correctamente" 
            : "Enfermedad actualizada correctamente"
        );
        
        _limpiarFormulario();
        _cargarEnfermedades();
      } else {
        _mostrarSnackbar("Error al guardar la enfermedad");
      }
    } catch (e) {
      debugPrint("Error: $e");
      _mostrarSnackbar("Error al guardar la enfermedad");
    }
  }

  Future<void> _eliminarEnfermedad(int id) async {
    try {
      final res = await http.delete(Uri.parse("$baseUrl/enfermedades/Eliminar/$id"));
      if (res.statusCode == 200) {
        _mostrarSnackbar("Enfermedad eliminada correctamente");
        _cargarEnfermedades();
      } else {
        _mostrarSnackbar("Error al eliminar enfermedad");
      }
    } catch (e) {
      debugPrint("Error al eliminar: $e");
      _mostrarSnackbar("Error al eliminar enfermedad");
    }
  }

  void _mostrarSnackbar(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensaje)),
    );
  }

  Future<void> _seleccionarFecha() async {
    final ahora = DateTime.now();
    final fechaSeleccionada = await showDatePicker(
      context: context,
      initialDate: ahora,
      firstDate: DateTime(ahora.year - 10),
      lastDate: ahora,
    );
    
    if (fechaSeleccionada != null) {
      setState(() {
        _fechaController.text = fechaSeleccionada.toIso8601String();
      });
    }
  }

  void _limpiarFormulario() {
    setState(() {
      _selectedMascota = '';
      _nombreController.clear();
      _descripcionController.clear();
      _fechaController.clear();
      _editId = null;
    });
  }

  void _abrirDialogo({Map<String, dynamic>? enfermedad}) {
    if (enfermedad != null) {
      _editId = enfermedad["id"];
      _selectedMascota = enfermedad["id_Mascota"].toString();
      _nombreController.text = enfermedad["nombre"] ?? "";
      _descripcionController.text = enfermedad["descripcion"] ?? "";
      _fechaController.text = enfermedad["fecha_diagnostico"] ?? "";
    } else {
      _limpiarFormulario();
    }

    showDialog(
      context: context,
      builder: (_) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: Text(_editId == null ? "Nueva enfermedad" : "Editar enfermedad"),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Selector de mascota
                    DropdownButtonFormField<String>(
                      value: _selectedMascota.isEmpty ? null : _selectedMascota,
                      decoration: const InputDecoration(
                        labelText: "Mascota",
                        border: OutlineInputBorder(),
                      ),
                      items: mascotas.map((mascota) {
                        return DropdownMenuItem<String>(
                          value: mascota['id'].toString(),
                          child: Text(mascota['nombre'] ?? "Sin nombre"),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setStateDialog(() {
                          _selectedMascota = value ?? '';
                        });
                      },
                    ),
                    const SizedBox(height: 10),
                    
                    // Nombre de la enfermedad
                    TextField(
                      controller: _nombreController,
                      decoration: const InputDecoration(
                        labelText: "Nombre de la enfermedad",
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 10),
                    
                    // Fecha de diagnóstico
                    TextField(
                      controller: _fechaController,
                      decoration: InputDecoration(
                        labelText: "Fecha de diagnóstico",
                        border: const OutlineInputBorder(),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.calendar_today, color: rojo),
                          onPressed: _seleccionarFecha,
                        ),
                      ),
                      readOnly: true,
                    ),
                    const SizedBox(height: 10),
                    
                    // Descripción
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
                  child: const Text("Cancelar", style: TextStyle(color: negro)),
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
            );
          },
        );
      },
    );
  }

  // Filtrar enfermedades según el rol del usuario
  List<dynamic> get _enfermedadesFiltradas {
    if (widget.userRole == 2) {
      return enfermedades.where((enfermedad) {
        final mascota = mascotas.firstWhere(
          (m) => m['id'] == enfermedad['id_Mascota'],
          orElse: () => {'id_cliente': ''}
        );
        return mascota['id_cliente'] == widget.nDocumento;
      }).toList();
    }
    return enfermedades;
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
        title: const Text("Gestión de Enfermedades", style: TextStyle(color: blanco)),
        centerTitle: true,
      ),
      body: cargando
          ? const Center(child: CircularProgressIndicator(color: rojo))
          : RefreshIndicator(
              color: rojo,
              onRefresh: _cargarDatos,
              child: Column(
                children: [
                  // Información del total
                  Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      'Total de Enfermedades: ${_enfermedadesFiltradas.length}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  
                  // Lista de enfermedades
                  Expanded(
                    child: ListView.builder(
                      itemCount: _enfermedadesFiltradas.length,
                      itemBuilder: (context, index) {
                        final enfermedad = _enfermedadesFiltradas[index];
                        final mascota = mascotas.firstWhere(
                          (m) => m['id'] == enfermedad['id_Mascota'],
                          orElse: () => {'nombre': 'Desconocida'}
                        );
                        
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          elevation: 4,
                          child: ListTile(
                            title: Text(
                              enfermedad["nombre"] ?? "Sin nombre",
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, color: negro),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Mascota: ${mascota['nombre']}"),
                                if (enfermedad['fecha_diagnostico'] != null)
                                  Text(
                                    "Fecha: ${DateFormat('yyyy-MM-dd').format(DateTime.parse(enfermedad['fecha_diagnostico']))}",
                                    style: const TextStyle(color: gris),
                                  ),
                                if (enfermedad['descripcion'] != null && 
                                    enfermedad['descripcion'].toString().isNotEmpty)
                                  Text("Descripción: ${enfermedad['descripcion']}"),
                              ],
                            ),
                            trailing: (widget.userRole == 3 || widget.userRole == 1)
                                ? PopupMenuButton<String>(
                                    onSelected: (value) {
                                      if (value == "editar") {
                                        _abrirDialogo(enfermedad: enfermedad);
                                      } else if (value == "eliminar") {
                                        _eliminarEnfermedad(enfermedad["id"]);
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
                                  )
                                : null,
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: (widget.userRole == 1 || widget.userRole == 3)
          ? FloatingActionButton(
              backgroundColor: rojo,
              onPressed: () => _abrirDialogo(),
              child: const Icon(Icons.add, color: blanco),
            )
          : null,
    );
  }
}