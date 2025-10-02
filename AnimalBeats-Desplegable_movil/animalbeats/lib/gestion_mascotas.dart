import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:pdf/widgets.dart' as pw;
import 'package:pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'menu.dart';
import 'Detalle_Citas.dart';

//Color rojo principal
const Color rojo = Color(0xFFDF2935);
//URL backend
const String baseUrl = "https://animalbeats-api.onrender.com";

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
  // ignore: unused_field
  int? _historialId;
  Map<String, dynamic>? _historialData;

  // ignore: unused_field
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
        Uri.parse("$baseUrl/Mascotas/Eliminar/$idMascota"),
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
      // 1. Mascota
      final resMascota = await http.get(Uri.parse("$baseUrl/Mascotas/$idMascota"));
        Map<String, dynamic> mascota = {};

        if (resMascota.statusCode == 200) {
          final data = json.decode(resMascota.body);

          if (data is Map<String, dynamic>) {
            mascota = {
              "id": data["id"] ?? "-",
              "nombre": data["nombre"] ?? "-",
              "fecha_nacimiento": data["fecha_nacimiento"] ?? "-",
              "especie": data["especie"]?["especie"] ?? "-",
              "raza": data["raza"]?["raza"] ?? "-",
              "tutor": data["usuarios"]?["nombre"] ?? "-", // clave 'tutor' para tu UI
            };
          }
        }



      // 2. Citas
      final resCitas = await http.get(Uri.parse("$baseUrl/Citas/mascota/$idMascota"));
      List<Map<String, dynamic>> citas = [];
      if (resCitas.statusCode == 200) {
        final data = json.decode(resCitas.body);
        if (data is List) citas = List<Map<String, dynamic>>.from(data);
      }

      // 3. Recordatorios
      final resRecordatorios = await http.get(Uri.parse("$baseUrl/recordatorio/mascota/$idMascota"));
      List<Map<String, dynamic>> recordatorios = [];
      if (resRecordatorios.statusCode == 200) {
        final data = json.decode(resRecordatorios.body);
        if (data is List) recordatorios = List<Map<String, dynamic>>.from(data);
      }

      setState(() {
        _historialData = {
          "mascota": mascota,
          "citas": citas,
          "recordatorios": recordatorios,
        };
      });
    } catch (e) {
      setState(() {
        _historialData = {};
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión al cargar historial ❌")),
      );
    }
  }

  // ---------------- PDF: Descargar ----------------
  Future<void> _descargarHistorialPDF(
      Map<String, dynamic> mascota,
      List<Map<String, dynamic>> recordatorios,
      List<Map<String, dynamic>> citas) async {
    final pdf = pw.Document();

    final logo = pw.MemoryImage(
  (await rootBundle.load('img/logo.png')).buffer.asUint8List(),
  );

    final fechaHoraDescarga = DateTime.now();

    pdf.addPage(
      pw.MultiPage(
        margin: const pw.EdgeInsets.all(24),
        build: (context) => [
          //Encabezado con logo
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Image(logo, height: 60),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Text("Historial Médico",
                      style: pw.TextStyle(fontSize: 20, fontWeight: pw.FontWeight.bold)),
                  pw.Text(
                      "Descargado el: ${fechaHoraDescarga.toLocal().toString().split('.')[0]}",
                      style: const pw.TextStyle(fontSize: 10)),
                ],
              ),
            ],
          ),
          pw.Divider(),

          pw.SizedBox(height: 10),
          pw.Text("Información de la Mascota",
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 5),

          //Tabla mascota
          pw.Table.fromTextArray(
            border: pw.TableBorder.all(color: PdfColors.red, width: 1),
            headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
            headerDecoration: const pw.BoxDecoration(color: PdfColors.red),
            cellAlignment: pw.Alignment.centerLeft,
            headerHeight: 25,
            cellHeight: 25,
            headers: ["ID", "Nombre", "Nacimiento", "Especie", "Raza", "Tutor"],
            data: [
              [
                mascota["id"] ?? "-",
                mascota["nombre"] ?? "-",
                mascota["fecha_nacimiento"] ?? "-",
                mascota["especie"] ?? "-",
                mascota["raza"] ?? "-",
                mascota["cliente"] ?? "-"
              ]
            ],
          ),

          pw.SizedBox(height: 20),
          pw.Text("Recordatorios",
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 5),

          recordatorios.isNotEmpty
              ? pw.Table.fromTextArray(
                  border: pw.TableBorder.all(color: PdfColors.grey700, width: 1),
                  headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                  headerDecoration: const pw.BoxDecoration(color: PdfColors.red),
                  cellAlignment: pw.Alignment.centerLeft,
                  headers: ["Fecha", "Descripción"],
                  data: recordatorios
                      .map((r) => [r["fecha"] ?? "-", r["descripcion"] ?? "-"])
                      .toList(),
                )
              : pw.Text("No hay recordatorios registrados."),

          pw.SizedBox(height: 20),
          pw.Text("Citas",
              style: pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 5),

          citas.isNotEmpty
              ? pw.Table.fromTextArray(
                  border: pw.TableBorder.all(color: PdfColors.grey700, width: 1),
                  headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold, color: PdfColors.white),
                  headerDecoration: const pw.BoxDecoration(color: PdfColors.red),
                  cellAlignment: pw.Alignment.centerLeft,
                  headers: ["Fecha", "Hora", "Servicio"],
                  data: citas.map((c) =>
                      [c["fecha"] ?? "-", c["hora"] ?? "-", c["servicio"] ?? "-"]).toList(),
                )
              : pw.Text("No hay citas registradas."),
        ],
      ),
    );

    await Printing.layoutPdf(
      onLayout: (format) async => pdf.save(),
    );
  }


  // ---------------- UI Principal ----------------
  @override
  Widget build(BuildContext context) {
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
            _currentView = index;
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
    if (_mascotas.isEmpty) return const Center(child: Text("No hay mascotas registradas."));

    return ListView(
      padding: const EdgeInsets.all(10),
      children: _mascotas.map((m) {
        return Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          elevation: 4,
          child: ListTile(
            title: Text(m["nombre"]),
            subtitle: Text(
                  "${m["especie"]?["especie"] ?? "-"} - ${m["raza"]?["raza"] ?? "-"}"
              ),

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
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text("Confirmar suspensión"),
                        content: Text("¿Seguro que deseas suspender a la mascota \"${m["nombre"]}\"?"),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: const Text("Cancelar", style: TextStyle(color: Colors.black)),
                          ),
                          ElevatedButton(
                            style: ElevatedButton.styleFrom(backgroundColor: rojo, foregroundColor: Colors.white),
                            onPressed: () {
                              Navigator.pop(context);
                              _suspenderMascota(m["id"], m["nombre"]);
                            },
                            child: const Text("Sí, suspender"),
                          ),
                        ],
                      ),
                    );
                  },
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
          // Nombre de la mascota
          TextFormField(
            controller: _nombreCtrl,
            decoration: const InputDecoration(labelText: "Nombre de Mascota"),
            validator: (val) => val == null || val.isEmpty ? "Ingrese el nombre" : null,
          ),
          const SizedBox(height: 10),

          // Dropdown Especie
          DropdownButtonFormField<String>(
            value: _especieSeleccionada,
            decoration: const InputDecoration(labelText: "Especie"),
            items: _especies.map((e) {
              final id = e['id']?.toString() ?? "";
              final nombre = e['especie'] ?? "-";
              return DropdownMenuItem(value: id, child: Text(nombre));
            }).toList(),
            onChanged: (val) {
              setState(() {
                _especieSeleccionada = val;
                _razaSeleccionada = null;
                _razas = [];
              });
              if (val != null && val.isNotEmpty) _obtenerRazas(val);
            },
            validator: (val) => val == null || val.isEmpty ? "Seleccione una especie" : null,
            isExpanded: true,
          ),
          const SizedBox(height: 10),

          // Dropdown Raza
          DropdownButtonFormField<String>(
            value: _razaSeleccionada,
            decoration: const InputDecoration(labelText: "Raza"),
            items: _razas.map((r) {
              final id = r['id']?.toString() ?? "";
              final nombre = r['raza'] ?? "-";
              return DropdownMenuItem(value: id, child: Text(nombre));
            }).toList(),
            onChanged: (val) => setState(() => _razaSeleccionada = val),
            validator: (val) => val == null || val.isEmpty ? "Seleccione una raza" : null,
            isExpanded: true,
          ),
          const SizedBox(height: 10),

          // Fecha de nacimiento
          ListTile(
            title: Text(
              _fechaNacimiento == null
                  ? "Seleccione fecha de nacimiento"
                  : "Fecha: ${_fechaNacimiento!.toLocal().toIso8601String().split('T').first}",
            ),
            trailing: const Icon(Icons.calendar_today),
            onTap: () => _seleccionarFecha(context),
          ),

          // Documento del dueño
          TextFormField(
            controller: _nDocumentoCtrl,
            decoration: const InputDecoration(labelText: "Documento del dueño"),
            validator: (val) => val == null || val.isEmpty ? "Ingrese documento" : null,
          ),
          const SizedBox(height: 20),

          // Botón Crear
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: rojo,
              foregroundColor: Colors.white,
            ),
            onPressed: _crearMascota,
            child: const Text("Crear Mascota"),
          ),
        ],
      ),
    ),
  );
}


  Widget _modificarMascotaForm() {
  if (_modId == null) return const Center(child: Text("Seleccione una mascota para modificar"));

  final estados = ["Activo", "Suspendido"];

  return Padding(
    padding: const EdgeInsets.all(16.0),
    child: Form(
      key: _modificarFormKey,
      child: Column(
        children: [
          TextFormField(
            controller: _modNombreCtrl,
            decoration: const InputDecoration(labelText: "Nombre de Mascota"),
            validator: (val) => val == null || val.isEmpty ? "Ingrese el nombre" : null,
          ),
          const SizedBox(height: 10),
          DropdownButtonFormField<String>(
            value: _modEstado, // usar exactamente "Activo" o "Suspendido"
            decoration: const InputDecoration(labelText: "Estado"),
            items: estados
                .map((e) => DropdownMenuItem(
                      value: e,
                      child: Text(e),
                    ))
                .toList(),
            onChanged: (val) => setState(() => _modEstado = val ?? "Activo"),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: rojo,
              foregroundColor: Colors.white,
            ),
            onPressed: _modificarMascota,
            child: const Text("Guardar cambios"),
          ),
        ],
      ),
    ),
  );
}


 Widget _historialMascota() {
  if (_historialData == null) {
    return const Center(child: Text("Selecciona una mascota para ver su historial"));
  }

  final mascota = _historialData?["mascota"] ?? {};
  final recordatorios = List<Map<String, dynamic>>.from(_historialData?["recordatorios"] ?? []);
  final citas = List<Map<String, dynamic>>.from(_historialData?["citas"] ?? []);

  // Acceder correctamente a los campos anidados y manejar tipos
  final especie = (mascota["especie"] is Map)
      ? mascota["especie"]["especie"] ?? "-"
      : mascota["especie"]?.toString() ?? "-";

  final raza = (mascota["raza"] is Map)
      ? mascota["raza"]["raza"] ?? "-"
      : mascota["raza"]?.toString() ?? "-";

  final tutor = mascota["tutor"] ?? "-"; // ⚡ Aquí está la corrección

  return ListView(
    padding: const EdgeInsets.all(16),
    children: [
      Text(
        "Historial de ${mascota["nombre"] ?? "Mascota"}",
        style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
      ),
      const SizedBox(height: 10),

      Card(
        child: ListTile(
          title: Text("ID: ${mascota["id"] ?? "-"} - ${mascota["nombre"] ?? "-"}"),
          subtitle: Text(
            "Nacimiento: ${mascota["fecha_nacimiento"] ?? "-"}\n"
            "Especie: $especie\n"
            "Raza: $raza\n"
            "Tutor: $tutor",
          ),
        ),
      ),

      const SizedBox(height: 20),
      const Text("📌 Recordatorios", style: TextStyle(fontWeight: FontWeight.bold)),
      ...recordatorios.map((r) => Card(
            child: ListTile(
              title: Text(r["descripcion"] ?? "-"),
              subtitle: Text("Fecha: ${r["fecha"] ?? "-"}"),
            ),
          )),
      if (recordatorios.isEmpty) const Text("No hay recordatorios"),

      const SizedBox(height: 20),
      const Text("📌 Citas", style: TextStyle(fontWeight: FontWeight.bold)),
      ...citas.map((c) {
        final servicio = c["servicios"]?["servicio"] ?? "-";
        final estadoCita = c["estado"] ?? "Pendiente";

        String fechaHora = "-";
        if (c["fecha"] != null) {
          final dt = DateTime.tryParse(c["fecha"]);
          if (dt != null) {
            fechaHora =
                "${dt.day.toString().padLeft(2,'0')}/${dt.month.toString().padLeft(2,'0')}/${dt.year} ${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}";
          }
        }

        return Card(
          child: ListTile(
            title: Text(servicio),
            subtitle: Text(
              "Fecha y hora: $fechaHora\nEstado: $estadoCita",
              style: TextStyle(
                color: (estadoCita == "Cancelado") ? Colors.red : Colors.black,
              ),
            ),
            trailing: (estadoCita != "Completado" && estadoCita != "Cancelado")
                ? ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: rojo,
                      foregroundColor: Colors.white,
                    ),
                    onPressed: () async {
                      final actualizado = await Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ConfirmarCitaPage(
                            idCita: int.tryParse(c["id"].toString()) ?? 0,
                            userRole: widget.userRole,
                          ),
                        ),
                      );
                      if (actualizado == true && _historialId != null) {
                        _fetchHistorial(_historialId!);
                      }
                    },
                    child: const Text("Ver cita"),
                  )
                : null,
          ),
        );
      }),
      if (citas.isEmpty) const Text("No hay citas"),

      const SizedBox(height: 20),
      ElevatedButton.icon(
        onPressed: () => _descargarHistorialPDF(mascota, recordatorios, citas),
        icon: const Icon(Icons.download, color: Colors.white),
        label: const Text("Descargar Historial PDF"),
        style: ElevatedButton.styleFrom(
          backgroundColor: rojo,
          foregroundColor: Colors.white,
        ),
      ),
    ],
  );
}



}
