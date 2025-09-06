import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'menu.dart';

// 🔴 Color rojo principal
const Color rojo = Color(0xFFDF2935);
// 🌐 URL backend
const String baseUrl = "https://animalbeats-backend-production.up.railway.app";

class GestionMascotas extends StatefulWidget {
  final int userRole;
  const GestionMascotas({super.key, required this.userRole});

  @override
  State<GestionMascotas> createState() => _GestionMascotasState();
}

class _GestionMascotasState extends State<GestionMascotas> {
  int _currentView = 0; // 0=consultar, 1=crear, 2=historial, 3=modificar
  List<dynamic> _mascotas = [];
  bool _cargando = true;
  String? _error;

  // Crear mascota
  final _crearFormKey = GlobalKey<FormState>();
  List<dynamic> _especies = [];
  List<dynamic> _razas = [];
  String? _especieSeleccionada;
  String? _razaSeleccionada;
  DateTime? _fechaNacimiento;
  final TextEditingController _nombreCtrl = TextEditingController();
  final TextEditingController _nDocumentoCtrl = TextEditingController();

  // Modificar mascota
  final _modificarFormKey = GlobalKey<FormState>();
  final TextEditingController _modNombreCtrl = TextEditingController();
  String _modEstado = "Activo";
  int? _modId;

  // Historial
  int? _historialId;
  Map<String, dynamic>? _historialData;

  String? _errorCrear;

  @override
  void initState() {
    super.initState();
    _fetchMascotas();
    _obtenerEspecies();
  }

  // ---------------- API: Consultar mascotas ----------------
  Future<void> _fetchMascotas() async {
    setState(() {
      _cargando = true;
      _error = null;
    });
    try {
      final res = await http.get(Uri.parse("$baseUrl/Mascotas"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is List) {
          setState(() {
            _mascotas = data;
            _error = null;
          });
        } else {
          setState(() {
            _error = "No hay mascotas registradas";
            _mascotas = [];
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

  // ---------------- API: Especies ----------------
  Future<void> _obtenerEspecies() async {
    try {
      final res = await http.get(Uri.parse('$baseUrl/Especies/Listado'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is List) {
          setState(() {
            _especies = data;
            _errorCrear = null;
          });
        } else {
          setState(() {
            _especies = [];
            _errorCrear = "Formato inesperado en especies";
          });
        }
      } else {
        setState(() {
          _errorCrear = "Error al obtener especies";
        });
      }
    } catch (e) {
      setState(() {
        _errorCrear = "Error al conectar con el servidor";
      });
    }
  }

  // ---------------- API: Razas ----------------
  Future<void> _obtenerRazas(String idEspecie) async {
    setState(() {
      _cargando = true;
    });
    try {
      final res = await http.get(Uri.parse('$baseUrl/Razas/Listado/$idEspecie'));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data is List) {
          setState(() {
            _razas = data;
            _razaSeleccionada = null;
            _errorCrear = null;
          });
        } else {
          setState(() {
            _razas = [];
            _razaSeleccionada = null;
            _errorCrear = "Formato inesperado en razas";
          });
        }
      } else {
        setState(() {
          _razas = [];
          _razaSeleccionada = null;
          _errorCrear = "Error al obtener razas";
        });
      }
    } catch (e) {
      setState(() {
        _razas = [];
        _razaSeleccionada = null;
        _errorCrear = "Error al conectar con el servidor";
      });
    }
    setState(() {
      _cargando = false;
    });
  }

  // ---------------- Helpers ----------------
  void _onEspecieChange(String? value) {
    if (value == null) return;
    setState(() {
      _especieSeleccionada = value;
      _razaSeleccionada = null;
      _razas = [];
    });
  }

  void _onRazaChange(String? value) {
    if (value == null) return;
    setState(() {
      _razaSeleccionada = value;
    });
  }

  Future<void> _seleccionarFecha(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _fechaNacimiento ?? DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime.now(),
    );
    if (picked != null) {
      setState(() {
        _fechaNacimiento = picked;
      });
    }
  }

  // ---------------- CRUD Crear ----------------
  Future<void> _crearMascota() async {
    if (!_crearFormKey.currentState!.validate()) return;

    if (_especieSeleccionada == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Seleccione una especie")));
      return;
    }
    if (_razaSeleccionada == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Seleccione una raza")));
      return;
    }
    if (_fechaNacimiento == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Seleccione una fecha de nacimiento")));
      return;
    }

    final mascotaData = {
      "nombre": _nombreCtrl.text,
      "id_especie": int.parse(_especieSeleccionada!),
      "id_raza": int.parse(_razaSeleccionada!),
      "fecha_nacimiento": _fechaNacimiento!.toIso8601String().split('T').first,
      "id_cliente": _nDocumentoCtrl.text,
      "estado": "Activo",
    };

    try {
      final res = await http.post(Uri.parse('$baseUrl/Mascotas/Registro'),
          headers: {"Content-Type": "application/json"},
          body: json.encode(mascotaData));
      if (res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Mascota creada exitosamente ✅")));
        _nombreCtrl.clear();
        _nDocumentoCtrl.clear();
        setState(() {
          _especieSeleccionada = null;
          _razaSeleccionada = null;
          _fechaNacimiento = null;
          _razas = [];
          _errorCrear = null;
          _currentView = 0;
        });
        _fetchMascotas();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error al crear mascota: ${res.statusCode}")));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Error de conexión ❌")));
    }
  }

  // ---------------- CRUD Modificar ----------------
  Future<void> _modificarMascota() async {
    if (_modId == null) return;
    if (!_modificarFormKey.currentState!.validate()) return;

    try {
      final res = await http.put(Uri.parse("$baseUrl/Mascotas/Actualizar/$_modId"),
          headers: {"Content-Type": "application/json"},
          body: json.encode({
            "nombre": _modNombreCtrl.text,
            "estado": _modEstado,
          }));
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Mascota modificada con éxito ✅")));
        _fetchMascotas();
        setState(() {
          _currentView = 0;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text("Error al modificar mascota: ${res.statusCode}")));
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text("Error de conexión ❌")));
    }
  }

  // ---------------- CRUD Suspender ----------------
  Future<void> _suspenderMascota(int idMascota, String nombre) async {
    try {
      final res = await http.put(
        Uri.parse("$baseUrl/Mascotas/Suspender/$idMascota"),
        headers: {"Content-Type": "application/json"},
      );
      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Mascota $nombre suspendida ✅")),
        );
        _fetchMascotas();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error al suspender: ${res.statusCode}")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión ❌")),
      );
    }
  }

  // ---------------- API: Historial ----------------
  Future<void> _fetchHistorial(int idMascota) async {
    setState(() {
      _historialId = idMascota;
      _historialData = null;
    });

    try {
      final res = await http.get(Uri.parse("$baseUrl/Mascotas/Historial/$idMascota"));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          _historialData = data;
        });
      } else {
        setState(() {
          _historialData = {};
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("No se encontró historial ❌")),
        );
      }
    } catch (e) {
      setState(() {
        _historialData = {};
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión al cargar historial ❌")),
      );
    }
  }

  // ---------------- UI Principal ----------------
  @override
Widget build(BuildContext context) {
  // El BottomNavigationBar tiene 3 ítems (índices 0,1,2)
  // La vista de modificar mascota es el índice 3, que no está en el menú inferior
  // Por eso cuando _currentView es 3, BottomNavigationBar muestra índice 0 para evitar error

  int bottomNavIndex = (_currentView >= 0 && _currentView <= 2) ? _currentView : 0;

  return Scaffold(
    appBar: AppBar(
      title: const Text("Gestión de Mascotas"),
      backgroundColor: rojo,
    ),
    drawer: OffcanvasMenu(userRole: widget.userRole),
    body: _getCurrentView(),
    bottomNavigationBar: BottomNavigationBar(
      currentIndex: bottomNavIndex,
      selectedItemColor: rojo,
      onTap: (index) {
        setState(() {
          _currentView = index; // Solo va de 0 a 2 cuando se usa BottomNavigationBar
        });
        if (index == 0) _fetchMascotas();
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.pets), label: "Consultar"),
        BottomNavigationBarItem(icon: Icon(Icons.add), label: "Crear"),
        BottomNavigationBarItem(icon: Icon(Icons.history), label: "Historial"),
      ],
    ),
  );
}

  // ---------------- Vistas ----------------
  Widget _getCurrentView() {
    switch (_currentView) {
      case 0:
        return _consultarMascotas();
      case 1:
        return _crearMascotaForm();
      case 2:
        return _historialMascota();
      case 3:
        return _modificarMascotaForm();
      default:
        return _consultarMascotas();
    }
  }

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
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 4,
          child: ListTile(
            title: Text(m["nombre"]),
            subtitle: Text("${m["especie"]} - ${m["raza"]}"),
            trailing: Wrap(
              spacing: 10,
              children: [
                IconButton(
                  icon: const Icon(Icons.history, color: rojo),
                  onPressed: () {
                    setState(() {
                      _currentView = 2;
                    });
                    _fetchHistorial(m["id"]);
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.edit, color: Colors.red),
                  onPressed: () {
                    setState(() {
                      _modId = m["id"];
                      _modNombreCtrl.text = m["nombre"];
                      _modEstado = m["estado"] ?? "Activo";
                      _currentView = 3;
                    });
                  },
                ),
                IconButton(
                  icon: const Icon(Icons.delete, color: Colors.red),
                  onPressed: () => _suspenderMascota(m["id"], m["nombre"]),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }

  Widget _crearMascotaForm() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Form(
        key: _crearFormKey,
        child: ListView(
          children: [
            TextFormField(
              controller: _nombreCtrl,
              decoration: const InputDecoration(labelText: "Nombre de Mascota"),
              validator: (val) => val == null || val.isEmpty ? "Ingrese el nombre" : null,
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: _especieSeleccionada,
              decoration: const InputDecoration(labelText: "Especie"),
              items: _especies.map((e) {
                return DropdownMenuItem(
                    value: e['id'].toString(), child: Text(e['Especie']));
              }).toList(),
              onChanged: (val) {
                setState(() {
                  _especieSeleccionada = val;
                  _razaSeleccionada = null;
                  _razas = [];
                });
                if (val != null) _obtenerRazas(val);
              },
              validator: (val) => val == null ? "Seleccione una especie" : null,
              isExpanded: true,
            ),
            const SizedBox(height: 10),
            DropdownButtonFormField<String>(
              value: _razaSeleccionada,
              decoration: const InputDecoration(labelText: "Raza"),
              items: _razas.map((r) {
                return DropdownMenuItem(
                    value: r['id'].toString(), child: Text(r['Raza']));
              }).toList(),
              onChanged: (val) {
                setState(() {
                  _razaSeleccionada = val;
                });
              },
              validator: (val) => val == null ? "Seleccione una raza" : null,
              isExpanded: true,
              disabledHint: const Text("Seleccione una especie primero"),
            ),
            ListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text("Fecha de Nacimiento"),
              subtitle: Text(_fechaNacimiento == null
                  ? "Seleccionar fecha"
                  : _fechaNacimiento!.toLocal().toString().split(' ')[0]),
              trailing: IconButton(
                icon: const Icon(Icons.calendar_today),
                onPressed: () => _seleccionarFecha(context),
              ),
            ),
            TextFormField(
              controller: _nDocumentoCtrl,
              decoration: const InputDecoration(labelText: "Código dueño"),
              validator: (val) =>
                  val == null || val.isEmpty ? "Ingrese el código del dueño" : null,
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _crearMascota,
              style: ElevatedButton.styleFrom(backgroundColor: rojo),
              child: const Text("Crear Mascota"),
            ),
          ],
        ),
      ),
    );
  }

  Widget _modificarMascotaForm() {
  return Padding(
    padding: const EdgeInsets.all(16.0),
    child: Form(
      key: _modificarFormKey,
      child: Column(
        children: [
          TextFormField(
            controller: _modNombreCtrl,
            decoration: const InputDecoration(labelText: "Nombre"),
            validator: (val) =>
                val == null || val.trim().isEmpty ? "Ingrese el nombre" : null,
          ),
          DropdownButtonFormField<String>(
            decoration: const InputDecoration(labelText: "Estado"),
            value: _modEstado,
            items: const [
              DropdownMenuItem(value: "Activo", child: Text("Activo")),
              DropdownMenuItem(value: "Suspendido", child: Text("Suspendido")),
            ],
            onChanged: (value) {
              if (value != null) setState(() => _modEstado = value);
            },
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _modificarMascota,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
              foregroundColor: Colors.white, // texto blanco
            ),
            child: const Text("Guardar Cambios"),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentView = 0;
              });
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.grey,
              foregroundColor: Colors.black, // texto negro
              shadowColor: Colors.transparent,
              elevation: 0,
            ),
            child: const Text("Cancelar"),
          ),
        ],
      ),
    ),
  );
}


  Widget _historialMascota() {
    if (_historialId == null) {
      return const Center(
          child: Text("Selecciona una mascota para ver su historial"));
    }
    if (_historialData == null) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_historialData!.isEmpty) {
      return const Center(child: Text("No hay historial para esta mascota"));
    }

    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: ListView(
        children: [
          Text("Historial de Mascota ID: $_historialId",
              style:
                  const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 10),
          ..._historialData!.entries.map((entry) {
            return Card(
              margin: const EdgeInsets.symmetric(vertical: 8),
              child: ListTile(
                title: Text(entry.key),
                subtitle: Text(entry.value.toString()),
              ),
            );
          }).toList(),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: () {
              setState(() {
                _currentView = 0;
              });
            },
            style: ElevatedButton.styleFrom(backgroundColor: rojo),
            child: const Text("Volver"),
          ),
        ],
      ),
    );
  }
}
