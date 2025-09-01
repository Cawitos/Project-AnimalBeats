import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// 🎨 Color principal rojo
const Color rojo = Color(0xFFDF2935);

// URL base de tu backend en Railway
const String baseUrl = "https://animalbeats-backend-production.up.railway.app";

class GestionMascotas extends StatefulWidget {
  const GestionMascotas({super.key});

  @override
  State<GestionMascotas> createState() => _GestionMascotasState();
}

class _GestionMascotasState extends State<GestionMascotas> {
  int _currentView = 0; // 0 = consultar, 1 = crear, 2 = historial
  List<dynamic> _mascotas = [];
  bool _cargando = true;
  String? _error;

  // Controladores para el formulario
  final TextEditingController _nombreCtrl = TextEditingController();
  final TextEditingController _especieCtrl = TextEditingController();
  final TextEditingController _razaCtrl = TextEditingController();
  final TextEditingController _idClienteCtrl = TextEditingController();

  // Para historial
  int? _historialId;
  Map<String, dynamic>? _historialData;

  @override
  void initState() {
    super.initState();
    _fetchMascotas();
  }

  // 📌 GET: Consultar mascotas
  Future<void> _fetchMascotas() async {
    setState(() {
      _cargando = true;
      _error = null;
    });

    try {
      final res = await http.get(Uri.parse("$baseUrl/mascotas"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is List) {
          setState(() {
            _mascotas = data;
          });
        } else {
          setState(() {
            _error = "Error: respuesta inesperada";
          });
        }
      } else {
        setState(() {
          _error = "Error al cargar mascotas";
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

  // 📌 POST: Crear mascota
  Future<void> _crearMascota() async {
    try {
      final res = await http.post(
        Uri.parse("$baseUrl/Mascotas/Crear"),
        headers: {"Content-Type": "application/json"},
        body: json.encode({
          "nombre": _nombreCtrl.text,
          "especie": _especieCtrl.text,
          "raza": _razaCtrl.text,
          "id_cliente": _idClienteCtrl.text,
        }),
      );

      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Mascota creada con éxito ✅")),
        );
        _nombreCtrl.clear();
        _especieCtrl.clear();
        _razaCtrl.clear();
        _idClienteCtrl.clear();
        _fetchMascotas();
        setState(() {
          _currentView = 0; // volver a consultar
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Error al crear la mascota ❌")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión ❌")),
      );
    }
  }

  // 📌 GET: Historial de mascota
  Future<void> _fetchHistorial(int id) async {
    try {
      final res = await http.get(Uri.parse("$baseUrl/Mascotas/historial/$id"));
      if (res.statusCode == 200) {
        setState(() {
          _historialData = json.decode(res.body);
          _historialId = id;
        });
      } else {
        setState(() {
          _historialData = null;
        });
      }
    } catch (e) {
      setState(() {
        _historialData = null;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text("Gestión de Mascotas"),
        backgroundColor: rojo,
      ),
      body: _getCurrentView(),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _currentView,
        selectedItemColor: rojo,
        onTap: (index) {
          setState(() {
            _currentView = index;
          });
        },
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.pets),
            label: "Consultar",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.add),
            label: "Crear",
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.history),
            label: "Historial",
          ),
        ],
      ),
    );
  }

  // 🔽 Secciones
  Widget _getCurrentView() {
    switch (_currentView) {
      case 0:
        return _consultarMascotas();
      case 1:
        return _crearMascotaForm();
      case 2:
        return _historialMascota();
      default:
        return _consultarMascotas();
    }
  }

  // 📌 Vista 1: Consultar
  Widget _consultarMascotas() {
    if (_cargando) return const Center(child: CircularProgressIndicator());
    if (_error != null) return Center(child: Text(_error!));

    if (_mascotas.isEmpty) {
      return const Center(child: Text("No hay mascotas registradas."));
    }

    return ListView(
      padding: const EdgeInsets.all(10),
      children: _mascotas.map((m) {
        return Card(
          shape:
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 4,
          child: ListTile(
            title: Text(m["nombre"]),
            subtitle: Text("${m["especie"]} - ${m["raza"]}"),
            trailing: IconButton(
              icon: const Icon(Icons.history, color: rojo),
              onPressed: () {
                setState(() {
                  _currentView = 2;
                });
                _fetchHistorial(m["id"]);
              },
            ),
          ),
        );
      }).toList(),
    );
  }

  // 📌 Vista 2: Crear mascota
  Widget _crearMascotaForm() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          TextField(
            controller: _nombreCtrl,
            decoration: const InputDecoration(labelText: "Nombre"),
          ),
          TextField(
            controller: _especieCtrl,
            decoration: const InputDecoration(labelText: "Especie"),
          ),
          TextField(
            controller: _razaCtrl,
            decoration: const InputDecoration(labelText: "Raza"),
          ),
          TextField(
            controller: _idClienteCtrl,
            decoration: const InputDecoration(labelText: "Código dueño"),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _crearMascota,
            style: ElevatedButton.styleFrom(backgroundColor: rojo),
            child: const Text("Crear Mascota"),
          ),
        ],
      ),
    );
  }

  // 📌 Vista 3: Historial
  Widget _historialMascota() {
    if (_historialId == null) {
      return const Center(child: Text("Selecciona una mascota para ver su historial"));
    }

    if (_historialData == null) {
      return const Center(child: Text("No hay historial para esta mascota"));
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          Text("Historial de ${_historialData!["nombre"]}",
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ...(_historialData!["citas"] as List).map((cita) {
            return ListTile(
              leading: const Icon(Icons.calendar_today, color: rojo),
              title: Text("Cita: ${cita["fecha"]}"),
              subtitle: Text("Motivo: ${cita["motivo"]}"),
            );
          }).toList(),
        ],
      ),
    );
  }
}
