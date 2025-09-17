// lib/features/citas.dart
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

class CitasPage extends StatefulWidget {
  final int userRole;
  final String? nDocumento;

  const CitasPage({Key? key, required this.userRole, this.nDocumento})
      : super(key: key);

  @override
  State<CitasPage> createState() => _CitasPageState();
}

class _CitasPageState extends State<CitasPage> {
  List<dynamic> citas = [];
  List<dynamic> usuarios = [];
  List<dynamic> mascotas = [];
  List<dynamic> servicios = [];
  List<dynamic> veterinarios = [];
  List<dynamic> fechasOcupadas = [];
  bool cargando = true;

  final TextEditingController _fechaController = TextEditingController();
  final TextEditingController _descripcionController = TextEditingController();
  
  String _selectedMascota = '';
  String _selectedServicio = '';
  String _selectedVeterinario = '';
  int? _editId;

  @override
  void initState() {
    super.initState();
    _cargarDatos();
  }

  Future<void> _cargarDatos() async {
    setState(() => cargando = true);
    try {
      await _cargarUsuarios();
      await _cargarMascotas();
      await _cargarServicios();
      await _cargarVeterinarios();
      await _cargarCitas();
    } catch (e) {
      debugPrint("Error al cargar datos: $e");
    }
    setState(() => cargando = false);
  }

  Future<void> _cargarUsuarios() async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/usuario/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          usuarios = data['usuarios'] is List ? data['usuarios'] : [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar usuarios: $e");
    }
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

  Future<void> _cargarServicios() async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/servicios/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          servicios = data['servicios'] is List ? data['servicios'] : [];
        });
      }
    } catch (e) {
      debugPrint("Error al cargar servicios: $e");
    }
  }

  Future<void> _cargarVeterinarios() async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/usuario/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          veterinarios = (data['usuarios'] ?? [])
              .where((u) => u['id_rol'] == 3)
              .toList();
        });
      }
    } catch (e) {
      debugPrint("Error al cargar veterinarios: $e");
    }
  }

  Future<void> _cargarCitas() async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/Citas/Listado"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          citas = data is List ? data : [];
          
          // Extraer fechas ocupadas
          fechasOcupadas = citas
              .where((cita) => cita['estado'] == 'aceptada')
              .map((cita) => DateTime.parse(cita['fecha']).millisecondsSinceEpoch)
              .toList();
        });
      }
    } catch (e) {
      debugPrint("Error al cargar citas: $e");
    }
  }

  bool _verificarDisponibilidad(String fecha) {
    final fechaSeleccionada = DateTime.parse(fecha).millisecondsSinceEpoch;
    return !fechasOcupadas.any((fechaOcupada) {
      return (fechaSeleccionada - fechaOcupada).abs() < 60 * 60 * 1000;
    });
  }

  Future<void> _guardarCita() async {
    if (_selectedMascota.isEmpty || _selectedServicio.isEmpty || 
        _selectedVeterinario.isEmpty || _fechaController.text.isEmpty) {
      _mostrarSnackbar("Complete los campos obligatorios");
      return;
    }
    
    final fechaSeleccionada = DateTime.parse(_fechaController.text);
    final ahora = DateTime.now();
    if (fechaSeleccionada.isBefore(ahora)) {
      _mostrarSnackbar("No puedes registrar una cita en el pasado");
      return;
    }
    
    if (widget.userRole == 2 && !_verificarDisponibilidad(_fechaController.text)) {
      _mostrarSnackbar("La fecha seleccionada ya está ocupada");
      return;
    }
    
    try {
      final mascota = mascotas.firstWhere((m) => m['id'].toString() == _selectedMascota);
      
      final url = _editId == null 
          ? "$baseUrl/Citas/Registrar"
          : "$baseUrl/Citas/Actualizar/$_editId";
          
      final body = json.encode({
        'id_Mascota': _selectedMascota,
        'id_cliente': mascota['id_cliente'],
        'id_Servicio': _selectedServicio,
        'id_veterinario': _selectedVeterinario,
        'fecha': _fechaController.text,
        'Descripcion': _descripcionController.text,
        'estado': 'pendiente'
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
            ? "Cita registrada correctamente" 
            : "Cita actualizada correctamente"
        );
        
        _limpiarFormulario();
        _cargarCitas();
      } else {
        _mostrarSnackbar("Error al guardar la cita");
      }
    } catch (e) {
      debugPrint("Error: $e");
      _mostrarSnackbar("Error al guardar la cita");
    }
  }

  Future<void> _aceptarCita(int id) async {
    if (widget.userRole != 3 && widget.userRole != 1) {
      _mostrarSnackbar("Solo veterinarios y administradores pueden aceptar citas");
      return;
    }
    
    try {
      final res = await http.patch(Uri.parse("$baseUrl/Citas/Aceptar/$id"));
      if (res.statusCode == 200) {
        _cargarCitas();
        _mostrarSnackbar("Cita aceptada correctamente");
      } else {
        _mostrarSnackbar("Error al aceptar cita");
      }
    } catch (e) {
      debugPrint("Error al aceptar: $e");
      _mostrarSnackbar("Error al aceptar cita");
    }
  }

  Future<void> _rechazarCita(int id) async {
    if (widget.userRole != 3 && widget.userRole != 1) {
      _mostrarSnackbar("Solo veterinarios y administradores pueden rechazar citas");
      return;
    }
    
    try {
      final res = await http.patch(Uri.parse("$baseUrl/Citas/Rechazar/$id"));
      if (res.statusCode == 200) {
        _cargarCitas();
        _mostrarSnackbar("Cita rechazada correctamente");
      } else {
        _mostrarSnackbar("Error al rechazar cita");
      }
    } catch (e) {
      debugPrint("Error al rechazar: $e");
      _mostrarSnackbar("Error al rechazar cita");
    }
  }

  Future<void> _eliminarCita(int id) async {
    final cita = citas.firstWhere((c) => c['id'] == id);
    if (widget.userRole != 3 && widget.userRole != 1 && cita['id_cliente'] != widget.nDocumento) {
      _mostrarSnackbar("No puedes eliminar esta cita");
      return;
    }
    
    final confirmado = await _mostrarConfirmacion(
      '¿Estás seguro?',
      'Esta acción eliminará la cita permanentemente.'
    );
    
    if (!confirmado) return;
    
    try {
      final res = await http.delete(Uri.parse("$baseUrl/Citas/Eliminar/$id"));
      if (res.statusCode == 200) {
        _cargarCitas();
        _mostrarSnackbar("Cita eliminada correctamente");
      } else {
        _mostrarSnackbar("Error al eliminar cita");
      }
    } catch (e) {
      debugPrint("Error al eliminar: $e");
      _mostrarSnackbar("Error al eliminar cita");
    }
  }

  void _mostrarSnackbar(String mensaje) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(mensaje)),
    );
  }

  Future<bool> _mostrarConfirmacion(String titulo, String mensaje) async {
    final result = await showDialog<bool>(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text(titulo),
          content: Text(mensaje),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(false),
              child: const Text("Cancelar", style: TextStyle(color: negro)),
            ),
            TextButton(
              onPressed: () => Navigator.of(context).pop(true),
              child: const Text("Eliminar", style: TextStyle(color: rojo)),
            ),
          ],
        );
      },
    );
    
    return result ?? false;
  }

  Future<void> _seleccionarFecha() async {
    final ahora = DateTime.now();
    final fechaSeleccionada = await showDatePicker(
      context: context,
      initialDate: ahora,
      firstDate: ahora,
      lastDate: DateTime(ahora.year + 1),
    );
    
    if (fechaSeleccionada != null) {
      final horaSeleccionada = await showTimePicker(
        context: context,
        initialTime: TimeOfDay.fromDateTime(ahora),
      );
      
      if (horaSeleccionada != null) {
        final fechaCompleta = DateTime(
          fechaSeleccionada.year,
          fechaSeleccionada.month,
          fechaSeleccionada.day,
          horaSeleccionada.hour,
          horaSeleccionada.minute,
        );
        
        setState(() {
          _fechaController.text = fechaCompleta.toIso8601String();
        });
      }
    }
  }

  void _limpiarFormulario() {
    setState(() {
      _selectedMascota = '';
      _selectedServicio = '';
      _selectedVeterinario = '';
      _fechaController.clear();
      _descripcionController.clear();
      _editId = null;
    });
  }

  void _abrirDialogo({Map<String, dynamic>? cita}) {
    if (cita != null) {
      _editId = cita["id"];
      _selectedMascota = cita["id_Mascota"].toString();
      _selectedServicio = cita["id_Servicio"].toString();
      _selectedVeterinario = cita["id_veterinario"].toString();
      _fechaController.text = cita["fecha"] ?? "";
      _descripcionController.text = cita["Descripcion"] ?? "";
    } else {
      _limpiarFormulario();
    }

    showDialog(
      context: context,
      builder: (_) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              title: Text(_editId == null ? "Nueva cita" : "Editar cita"),
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
                      items: _mascotasFiltradas.map((mascota) {
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
                    
                    // Selector de servicio
                    DropdownButtonFormField<String>(
                      value: _selectedServicio.isEmpty ? null : _selectedServicio,
                      decoration: const InputDecoration(
                        labelText: "Servicio",
                        border: OutlineInputBorder(),
                      ),
                      items: servicios.map((servicio) {
                        return DropdownMenuItem<String>(
                          value: servicio['id'].toString(),
                          child: Text(servicio['servicio'] ?? "Sin nombre"),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setStateDialog(() {
                          _selectedServicio = value ?? '';
                        });
                      },
                    ),
                    const SizedBox(height: 10),
                    
                    // Selector de fecha y hora
                    TextField(
                      controller: _fechaController,
                      decoration: InputDecoration(
                        labelText: "Fecha y Hora",
                        border: const OutlineInputBorder(),
                        suffixIcon: IconButton(
                          icon: const Icon(Icons.calendar_today, color: rojo),
                          onPressed: _seleccionarFecha,
                        ),
                      ),
                      readOnly: true,
                    ),
                    if (_fechaController.text.isNotEmpty && !_verificarDisponibilidad(_fechaController.text))
                      const Padding(
                        padding: EdgeInsets.only(top: 8),
                        child: Text(
                          'Esta fecha podría estar ocupada',
                          style: TextStyle(color: Colors.orange),
                        ),
                      ),
                    const SizedBox(height: 10),
                    
                    // Campo de descripción
                    TextField(
                      controller: _descripcionController,
                      decoration: const InputDecoration(
                        labelText: "Descripción",
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 10),
                    
                    // Selector de veterinario
                    DropdownButtonFormField<String>(
                      value: _selectedVeterinario.isEmpty ? null : _selectedVeterinario,
                      decoration: const InputDecoration(
                        labelText: "Veterinario",
                        border: OutlineInputBorder(),
                      ),
                      items: veterinarios.map((veterinario) {
                        return DropdownMenuItem<String>(
                          value: veterinario['n_documento'].toString(),
                          child: Text(veterinario['nombre'] ?? "Sin nombre"),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setStateDialog(() {
                          _selectedVeterinario = value ?? '';
                        });
                      },
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
                    _guardarCita();
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

  // Filtrar mascotas según el rol del usuario
  List<dynamic> get _mascotasFiltradas {
    return widget.userRole == 2 
        ? mascotas.where((m) => m['id_cliente'] == widget.nDocumento).toList()
        : mascotas;
  }

  // Filtrar citas según el rol del usuario
  List<dynamic> get _citasFiltradas {
    return widget.userRole == 2
        ? citas.where((cita) => cita['id_cliente'] == widget.nDocumento).toList()
        : citas;
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
        title: const Text("Gestión de Citas", style: TextStyle(color: blanco)),
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
                      'Total de Citas: ${_citasFiltradas.length}',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                  ),
                  
                  // Lista de citas
                  Expanded(
                    child: ListView.builder(
                      itemCount: _citasFiltradas.length,
                      itemBuilder: (context, index) {
                        final cita = _citasFiltradas[index];
                        final mascota = mascotas.firstWhere(
                          (m) => m['id'] == cita['id_Mascota'],
                          orElse: () => {'nombre': 'Desconocido'}
                        );
                        
                        final cliente = usuarios.firstWhere(
                          (u) => u['id'] == cita['id_cliente'],
                          orElse: () => {'nombre': 'Desconocido'}
                        );
                        
                        final servicio = servicios.firstWhere(
                          (s) => s['id'] == cita['id_Servicio'],
                          orElse: () => {'servicio': 'Desconocido'}
                        );
                        
                        final veterinario = veterinarios.firstWhere(
                          (v) => v['n_documento'] == cita['id_veterinario'],
                          orElse: () => {'nombre': 'Desconocido'}
                        );
                        
                        Color estadoColor;
                        switch (cita['estado']) {
                          case 'pendiente':
                            estadoColor = Colors.orange;
                            break;
                          case 'aceptada':
                            estadoColor = Colors.green;
                            break;
                          case 'rechazada':
                            estadoColor = rojo;
                            break;
                          default:
                            estadoColor = gris;
                        }
                        
                        return Card(
                          margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12)),
                          elevation: 4,
                          child: ListTile(
                            title: Text(
                              "Cita - ${servicio['servicio']}",
                              style: const TextStyle(
                                  fontWeight: FontWeight.bold, color: negro),
                            ),
                            subtitle: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text("Mascota: ${mascota['nombre']}"),
                                Text("Cliente: ${cliente['nombre']}"),
                                Text("Veterinario: ${veterinario['nombre']}"),
                                Text("Fecha: ${DateFormat('yyyy-MM-dd HH:mm').format(DateTime.parse(cita['fecha']))}"),
                                if (cita['Descripcion'] != null && 
                                    cita['Descripcion'].toString().isNotEmpty)
                                  Text("Descripción: ${cita['Descripcion']}"),
                              ],
                            ),
                            trailing: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: estadoColor,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    cita['estado'],
                                    style: const TextStyle(color: blanco, fontSize: 12),
                                  ),
                                ),
                                if ((widget.userRole == 3 || widget.userRole == 1 || 
                                    (widget.userRole == 2 && cita['estado'] == 'pendiente')))
                                  PopupMenuButton<String>(
                                    onSelected: (value) {
                                      if (value == "editar") {
                                        _abrirDialogo(cita: cita);
                                      } else if (value == "eliminar") {
                                        _eliminarCita(cita["id"]);
                                      } else if (value == "aceptar") {
                                        _aceptarCita(cita["id"]);
                                      } else if (value == "rechazar") {
                                        _rechazarCita(cita["id"]);
                                      }
                                    },
                                    itemBuilder: (context) {
                                      final items = <PopupMenuItem<String>>[];
                                      
                                      if (widget.userRole == 3 || widget.userRole == 1 || 
                                          (widget.userRole == 2 && cita['estado'] == 'pendiente')) {
                                        items.add(const PopupMenuItem(
                                          value: "editar",
                                          child: Text("Editar"),
                                        ));
                                      }
                                      
                                      if (widget.userRole == 3 || widget.userRole == 1 || 
                                          (widget.userRole == 2 && cita['estado'] == 'pendiente')) {
                                        items.add(const PopupMenuItem(
                                          value: "eliminar",
                                          child: Text("Eliminar"),
                                        ));
                                      }
                                      
                                      if ((widget.userRole == 3 || widget.userRole == 1) && 
                                          cita['estado'] == 'pendiente') {
                                        items.add(const PopupMenuItem(
                                          value: "aceptar",
                                          child: Text("Aceptar"),
                                        ));
                                        items.add(const PopupMenuItem(
                                          value: "rechazar",
                                          child: Text("Rechazar"),
                                        ));
                                      }
                                      
                                      return items;
                                    },
                                  ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
      floatingActionButton: (widget.userRole == 1 || widget.userRole == 2)
          ? FloatingActionButton(
              backgroundColor: rojo,
              onPressed: () => _abrirDialogo(),
              child: const Icon(Icons.add, color: blanco),
            )
          : null,
    );
  }
}