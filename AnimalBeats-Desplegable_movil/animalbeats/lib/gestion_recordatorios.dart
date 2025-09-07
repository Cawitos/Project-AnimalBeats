import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import 'menu.dart';

const Color rojo = Color(0xFFDF2935);
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
      String url = "$baseUrl/Recordatorios";
      if (widget.userRole == 2) {
        url = "$baseUrl/Recordatorios/${widget.nDocumento}";
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

  // ---------------- API: Crear/Editar ----------------
  Future<void> _guardarRecordatorio() async {
    if (!_formKey.currentState!.validate()) return;

    final data = {
      "id_cliente": widget.userRole == 2 ? widget.nDocumento : _clienteCtrl.text,
      "id_mascota": _mascotaCtrl.text,
      "fecha": _fechaCtrl.text,
      "descripcion": _descripcionCtrl.text,
    };

    try {
      final res = _idEditar == null
          ? await http.post(
              Uri.parse('$baseUrl/Recordatorios/Registro'),
              headers: {"Content-Type": "application/json"},
              body: json.encode(data),
            )
          : await http.put(
              Uri.parse('$baseUrl/Recordatorios/Modificar/$_idEditar'),
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
      final res = await http.delete(Uri.parse('$baseUrl/Recordatorios/Eliminar/$id'));
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Recordatorio eliminado ✅")));
        _fetchRecordatorios();
      }
    } catch (_) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error de conexión ❌")));
    }
  }

  // ---------------- PDF ----------------
  Future<void> _descargarTodosPDF() async {
    final pdf = pw.Document();
    pdf.addPage(
      pw.Page(
        build: (pw.Context context) {
          return pw.Column(
            crossAxisAlignment: pw.CrossAxisAlignment.start,
            children: [
              pw.Text(
            "AnimalBeats - Recordatorios",
                style: pw.TextStyle(
                  fontSize: 22,
                  fontWeight: pw.FontWeight.bold,
                  color: PdfColors.red,
                ),
              ),
              pw.SizedBox(height: 20),
              for (var r in _recordatorios)
                pw.Container(
                  margin: const pw.EdgeInsets.only(bottom: 12),
                  padding: const pw.EdgeInsets.all(10),
                  decoration: pw.BoxDecoration(
                    border: pw.Border.all(color: PdfColors.grey),
                    borderRadius: pw.BorderRadius.circular(6),
                    color: PdfColors.grey100, // fondo del bloque
                  ),
                  child: pw.Column(
                    crossAxisAlignment: pw.CrossAxisAlignment.start,
                    children: [
                      pw.Text(
                        "Mascota: ${r['nombre_mascota'] ?? '-'}",
                        style: pw.TextStyle(
                          fontSize: 16,
                          fontWeight: pw.FontWeight.bold,
                          color: PdfColors.blue800,
                        ),
                      ),
                      pw.Text("Fecha: ${r['Fecha']}"),
                      pw.Text("Descripción: ${r['descripcion']}"),
                    ],
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
      appBar: AppBar(title: const Text("Gestión de Recordatorios"), backgroundColor: rojo),
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

  Widget _formRecordatorio() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _formKey,
        child: ListView(
          children: [
            if (widget.userRole != 2)
              TextFormField(
                controller: _clienteCtrl,
                decoration: const InputDecoration(labelText: "Documento Cliente"),
                validator: (val) => val == null || val.isEmpty ? "Ingrese el cliente" : null,
              ),
            TextFormField(
              controller: _mascotaCtrl,
              decoration: const InputDecoration(labelText: "ID Mascota"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese la mascota" : null,
            ),
            TextFormField(
              controller: _fechaCtrl,
              decoration: const InputDecoration(labelText: "Fecha (YYYY-MM-DD HH:mm)"),
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
                backgroundColor: rojo,            // color de fondo
                foregroundColor: Colors.white,    // color del texto/ícono
                textStyle: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: const Text("Crear Recordatorio"),
            ),
          ],
        ),
      ),
    );
  }
}
