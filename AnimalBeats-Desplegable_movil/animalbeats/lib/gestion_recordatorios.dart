import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_application_1/especies.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'menu.dart';

const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const String baseUrl = "https://animalbeats-backend-production.up.railway.app";

class GestionRecordatorios extends StatefulWidget {
  final int userRole;
  final String? nDocumento; // para clientes

  const GestionRecordatorios({super.key, required this.userRole, this.nDocumento});

  @override
  State<GestionRecordatorios> createState() => _GestionRecordatoriosState();
}

class _GestionRecordatoriosState extends State<GestionRecordatorios> {
  int _currentView = 0; // 0=consultar, 1=crear/editar
  List<dynamic> _recordatorios = [];
  bool _cargando = true;
  String? _error;

  // Crear/Editar
  final _formKey = GlobalKey<FormState>();
  final TextEditingController _clienteCtrl = TextEditingController();
  final TextEditingController _mascotaCtrl = TextEditingController();
  final TextEditingController _fechaCtrl = TextEditingController();
  final TextEditingController _descripcionCtrl = TextEditingController();
  int? _idEditar;
  String? _minFecha;

  @override
  void initState() {
    super.initState();
    _fetchRecordatorios();
    _setMinFecha();
  }

  void _setMinFecha() {
    final now = DateTime.now();
    _minFecha = DateFormat("yyyy-MM-ddTHH:mm").format(now);
  }

  // ---------------- API: Consultar ----------------
  Future<void> _fetchRecordatorios() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      String url = "$baseUrl/recordatorios";
      if (widget.userRole == 2) {
        url = "$baseUrl/recordatorios/${widget.nDocumento}";
      }
      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          _recordatorios = data is List ? data : [];
        });
      } else {
        setState(() {
          _error = "Error al cargar recordatorios";
        });
      }
    } catch (_) {
      setState(() {
        _error = "Error de conexión con el servidor";
      });
    }
    setState(() {
      _cargando = false;
    });
  }

Future<void> _guardarRecordatorio() async {
  if (!_formKey.currentState!.validate()) return;

  final data = {
    "cliente": widget.userRole == 2 ? widget.nDocumento : _clienteCtrl.text,
    "mascota": _mascotaCtrl.text,
    "fecha": _fechaCtrl.text,
    "descripcion": _descripcionCtrl.text,
  };
  try {
    final res = _idEditar == null
        ? await http.post(
            Uri.parse('$baseUrl/recordatorios/guardar'),
            headers: {"Content-Type": "application/json"},
            body: json.encode(data),
          )
        : await http.put(
            Uri.parse('$baseUrl/recordatorios/modificar/$_idEditar'),
            headers: {"Content-Type": "application/json"},
            body: json.encode(data),
          );

    if (res.statusCode == 200 || res.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(_idEditar == null
              ? "Recordatorio creado ✅"
              : "Recordatorio actualizado ✅")));
      _resetForm();
      setState(() => _currentView = 0);
      _fetchRecordatorios();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${res.statusCode}")));
    }
  } catch (_) {
    ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión ❌")));
  }
}

// ---------------- API: Eliminar ----------------
Future<void> _eliminarRecordatorio(int id) async {
  try {
    final res =
        await http.delete(Uri.parse('$baseUrl/recordatorios/eliminar/$id'));
    if (res.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Recordatorio eliminado ✅")));
      _fetchRecordatorios();
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error: ${res.statusCode}")));
    }
  } catch (_) {
    ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión ❌")));
  }
}

  // ---------------- PDF ----------------
  Future<void> _descargarTodosPDF() async {
  final pdf = pw.Document();

  // Fecha y hora actuales
  final now = DateTime.now();
  final fechaHora =
      "${now.day}/${now.month}/${now.year} ${now.hour}:${now.minute.toString().padLeft(2, '0')}";

  final logo = pw.MemoryImage(
  (await rootBundle.load('img/logo.png')).buffer.asUint8List(),
  );

  pdf.addPage(
    pw.Page(
      margin: const pw.EdgeInsets.all(24),
      build: (pw.Context context) {
        return pw.Column(
          crossAxisAlignment: pw.CrossAxisAlignment.start,
          children: [
            // Header con logo y título
            pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Image(logo, height: 60),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Text("Reporte de Recordatorios activos",
                      style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
                    pw.Text(
                      "Fecha y Hora: $fechaHora",
                      style: const pw.TextStyle(fontSize: 11),
                    ),
                  ],
                ),
              ],
            ),
            pw.SizedBox(height: 30),

            // Tabla con todos los recordatorios
            pw.TableHelper.fromTextArray(
              headers: ["Cliente", "Mascota", "Fecha", "Descripción"],
              data: _recordatorios.map((r) {
                return [
                  r['id_cliente']?.toString() ?? "-",
                  r['nombre_mascota'] ?? "-",
                  r['Fecha'] ?? "-",
                  r['descripcion'] ?? "-"
                ];
              }).toList(),
              headerStyle: pw.TextStyle(
                fontWeight: pw.FontWeight.bold,
                color: PdfColors.white,
              ),
              headerDecoration: const pw.BoxDecoration(
                color: PdfColor.fromInt(0xFFDF2935), // rojo AnimalBeats
              ),
              cellStyle: const pw.TextStyle(fontSize: 10),
              cellAlignments: {
                0: pw.Alignment.centerLeft,
                1: pw.Alignment.centerLeft,
                2: pw.Alignment.center,
                3: pw.Alignment.centerLeft,
              },
              oddRowDecoration:
                  const pw.BoxDecoration(color: PdfColors.grey100),
              border: pw.TableBorder.all(
                color: PdfColor.fromInt(0xFFDF2935),
                width: 0.5,
              ),
            ),
          ],
        );
      },
    ),
  );

  await Printing.layoutPdf(onLayout: (format) => pdf.save());
}


  // ---------------- Helpers ----------------
  void _cargarParaEditar(dynamic r) {
    _clienteCtrl.text = r["id_cliente"] ?? "";
    _mascotaCtrl.text = r["id_mascota"] ?? "";
    _fechaCtrl.text = r["Fecha"] ?? "";
    _descripcionCtrl.text = r["descripcion"] ?? "";
    _idEditar = r["id"];
    setState(() => _currentView = 1);
  }

  void _resetForm() {
    _clienteCtrl.clear();
    _mascotaCtrl.clear();
    _fechaCtrl.clear();
    _descripcionCtrl.clear();
    _idEditar = null;
  }

  // ---------------- UI ----------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: rojo,
        title: const Text("Gestión de Recordatorios", style: TextStyle(color: blanco)),
        centerTitle: true,
        ),
      drawer: OffcanvasMenu(userRole: widget.userRole),
      body: _getCurrentView(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentView,
        selectedItemColor: rojo,
        onTap: (index) {
          setState(() => _currentView = index);
          if (index == 0) _fetchRecordatorios();
        },
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.list), label: "Consultar"),
          if (widget.userRole != 2)
            const BottomNavigationBarItem(icon: Icon(Icons.add), label: "Crear"),
        ],
      ),
      floatingActionButton: _currentView == 0 && widget.userRole != 2
          ? FloatingActionButton(
              backgroundColor: rojo,
              onPressed: _descargarTodosPDF,
              child: const Icon(
                Icons.picture_as_pdf,
                color: Colors.white
                ),
            )
          : null,
    );
  }

  Widget _getCurrentView() {
    return _currentView == 0 ? _consultarRecordatorios() : _formRecordatorio();
  }

  Widget _consultarRecordatorios() {
    if (_cargando) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!));

    if (_recordatorios.isEmpty) {
      return const Center(child: Text("No hay recordatorios registrados."));
    }

    return ListView(
      padding: const EdgeInsets.all(10),
      children: _recordatorios.map((r) {
        return Card(
          child: ListTile(
            title: Text("Mascota: ${r["nombre_mascota"] ?? "-"}"),
            subtitle: Text("${r["descripcion"]}\nFecha: ${r["Fecha"]}"),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (widget.userRole != 2) ...[
                  IconButton(
                      icon: const Icon(Icons.edit, color: Colors.orange),
                      onPressed: () => _cargarParaEditar(r)),
                  IconButton(
                      icon: const Icon(Icons.delete, color: Colors.red),
                      onPressed: () => _eliminarRecordatorio(r["id"])),
                ],
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
List<dynamic> _mascotasCliente = [];

Future<void> _cargarMascotasCliente(String clienteId) async {
  if (clienteId.isEmpty) {
    setState(() => _mascotasCliente = []);
    return;
  }
  try {
    final res = await http.get(Uri.parse('$baseUrl/Mascota/recordatorio/$clienteId'));
    if (res.statusCode == 200) {
      final data = json.decode(res.body);
      setState(() {
        _mascotasCliente = data is List ? data : [data];
      });
    } else {
      setState(() => _mascotasCliente = []);
    }
  } catch (_) {
    setState(() => _mascotasCliente = []);
  }
}

// Para abrir calendario + hora
Future<void> _seleccionarFechaHora() async {
  final DateTime? fecha = await showDatePicker(
    context: context,
    initialDate: DateTime.now(),
    firstDate: DateTime.now(),
    lastDate: DateTime(2100),
  );
  if (fecha != null) {
    final TimeOfDay? hora = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
    );
    if (hora != null) {
      final dt = DateTime(fecha.year, fecha.month, fecha.day, hora.hour, hora.minute);
      _fechaCtrl.text = DateFormat("yyyy-MM-dd HH:mm:ss").format(dt);
    }
  }
}

Widget _formRecordatorio() {
  return Padding(
    padding: const EdgeInsets.all(16.0),
    child: Form(
      key: _formKey,
      child: ListView(
        children: [
          if (widget.userRole != 2) ...[
            TextFormField(
              controller: _clienteCtrl,
              decoration: const InputDecoration(labelText: "Documento Cliente"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese el cliente" : null,
              onChanged: (val) {
                if (val.length >= 5) {
                  _cargarMascotasCliente(val);
                } else {
                  setState(() => _mascotasCliente = []);
                }
              },
            ),
          ],

          DropdownButtonFormField<String>(
            value: _mascotasCliente.any((m) => m['id'].toString() == _mascotaCtrl.text)
                ? _mascotaCtrl.text
                : null,
            decoration: const InputDecoration(labelText: "Seleccione Mascota"),
            items: _mascotasCliente.map<DropdownMenuItem<String>>((mascota) {
              return DropdownMenuItem<String>(
                value: mascota['id'].toString(),
                child: Text(mascota['nombre'] ?? "Sin nombre"),
              );
            }).toList(),
            onChanged: (val) {
              setState(() {
                _mascotaCtrl.text = val ?? "";
              });
            },
            validator: (val) => val == null || val.isEmpty ? "Seleccione una mascota" : null,
          ),

          TextFormField(
            controller: _fechaCtrl,
            readOnly: true,
            decoration: const InputDecoration(labelText: "Fecha y Hora"),
            onTap: _seleccionarFechaHora,
            validator: (val) {
              if (val == null || val.isEmpty) return "Ingrese la fecha";
              if (_minFecha != null && val.compareTo(_minFecha!) < 0) {
                return "La fecha no puede ser anterior a ahora";
              }
              return null;
            },
          ),

          TextFormField(
            controller: _descripcionCtrl,
            decoration: const InputDecoration(labelText: "Descripción"),
            validator: (val) => val == null || val.isEmpty ? "Ingrese la descripción" : null,
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _guardarRecordatorio,
            style: ElevatedButton.styleFrom(
              backgroundColor: rojo,
              foregroundColor: Colors.white,
            ),
            child: Text(_idEditar == null ? "Guardar Recordatorio" : "Actualizar Recordatorio"),
          ),
        ],
      ),
    ),
  );
}}