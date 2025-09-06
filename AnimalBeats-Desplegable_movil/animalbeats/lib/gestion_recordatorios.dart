import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'menu.dart';

const Color rojo = Color(0xFFDF2935);
const String baseUrl = "https://animalbeats-backend-production.up.railway.app";

class GestionRecordatorios extends StatefulWidget {
  final int userRole;
  final String? nDocumento; // para clientes

  const GestionRecordatorios({super.key, required this.userRole, required this.nDocumento});

  @override
  State<GestionRecordatorios> createState() => _GestionRecordatoriosState();
}

class _GestionRecordatoriosState extends State<GestionRecordatorios> {
  int _currentView = 0; // 0=consultar, 1=crear
  List<dynamic> _recordatorios = [];
  bool _cargando = true;
  String? _error;

  // Crear
  final _crearFormKey = GlobalKey<FormState>();
  final TextEditingController _fechaCtrl = TextEditingController();
  final TextEditingController _descripcionCtrl = TextEditingController();
  final TextEditingController _clienteCtrl = TextEditingController();
  final TextEditingController _mascotaCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchRecordatorios();
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
        // Cliente
        url = "$baseUrl/Recordatorios/${widget.nDocumento}";
      }

      final res = await http.get(Uri.parse(url));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is List) {
          setState(() {
            _recordatorios = data;
            _error = null;
          });
        } else {
          setState(() {
            _error = "No hay recordatorios registrados";
            _recordatorios = [];
          });
        }
      } else {
        setState(() {
          _error = "Error al cargar recordatorios";
        });
      }
    } catch (e) {
      setState(() {
        _error = "Error de conexión con el servidor";
      });
    }
    setState(() {
      _cargando = false;
    });
  }

  // ---------------- API: Crear ----------------
  Future<void> _crearRecordatorio() async {
    if (!_crearFormKey.currentState!.validate()) return;

    final data = {
      "id_cliente": widget.userRole == 2 ? widget.nDocumento : _clienteCtrl.text,
      "id_mascota": _mascotaCtrl.text,
      "fecha": _fechaCtrl.text,
      "descripcion": _descripcionCtrl.text,
    };
    try {
      final res = await http.post(
        Uri.parse('$baseUrl/Recordatorios/Registro'),
        headers: {"Content-Type": "application/json"},
        body: json.encode(data),
      );
      if (res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text("Recordatorio creado exitosamente ✅")));
        _descripcionCtrl.clear();
        _clienteCtrl.clear();
        _mascotaCtrl.clear();
        _fechaCtrl.clear();
        setState(() {
          _currentView = 0;
        });
        _fetchRecordatorios();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Error al crear recordatorio: ${res.statusCode}")));
      }
    } catch (e) {
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
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text("Error al eliminar: ${res.statusCode}")));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error de conexión ❌")));
    }
  }

  // ---------------- UI Principal ----------------
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Gestión de Recordatorios"),
        backgroundColor: rojo,
      ),
      drawer: OffcanvasMenu(userRole: widget.userRole),
      body: _getCurrentView(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentView,
        selectedItemColor: rojo,
        onTap: (index) {
          setState(() {
            _currentView = index;
          });
          if (index == 0) _fetchRecordatorios();
        },
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.list), label: "Consultar"),
          if (widget.userRole != 2)
            const BottomNavigationBarItem(icon: Icon(Icons.add), label: "Crear"),
        ],
      ),
    );
  }

  Widget _getCurrentView() {
    switch (_currentView) {
      case 0:
        return _consultarRecordatorios();
      case 1:
        return _crearRecordatorioForm();
      default:
        return _consultarRecordatorios();
    }
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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 4,
          child: ListTile(
            title: Text("Mascota: ${r["nombre_mascota"] ?? "-"}"),
            subtitle: Text("${r["descripcion"]}\nFecha: ${r["Fecha"]}"),
            trailing: widget.userRole != 2
                ? IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _eliminarRecordatorio(r["id"]),
                  )
                : null,
          ),
        );
      }).toList(),
    );
  }

  Widget _crearRecordatorioForm() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _crearFormKey,
        child: ListView(
          children: [
            TextFormField(
              controller: _clienteCtrl,
              decoration: const InputDecoration(labelText: "ID Cliente"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese el cliente" : null,
            ),
            TextFormField(
              controller: _mascotaCtrl,
              decoration: const InputDecoration(labelText: "ID Mascota"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese la mascota" : null,
            ),
            TextFormField(
              controller: _fechaCtrl,
              decoration: const InputDecoration(labelText: "Fecha (YYYY-MM-DD)"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese la fecha" : null,
            ),
            TextFormField(
              controller: _descripcionCtrl,
              decoration: const InputDecoration(labelText: "Descripción"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese la descripción" : null,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _crearRecordatorio,
              style: ElevatedButton.styleFrom(backgroundColor: rojo),
              child: const Text("Crear Recordatorio"),
            ),
          ],
        ),
      ),
    );
  }
}
