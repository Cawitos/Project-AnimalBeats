import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

// Color principal
const Color rojo = Color(0xFFDF2935);
// URL backend
const String baseUrl = "https://animalbeats-backend-production.up.railway.app";

class DetalleCitaPage extends StatefulWidget {
  final int idMascota;
  final int idCita;

  const DetalleCitaPage({
    super.key,
    required this.idMascota,
    required this.idCita,
  });

  @override
  State<DetalleCitaPage> createState() => _DetalleCitaPageState();
}

class _DetalleCitaPageState extends State<DetalleCitaPage> {
  Map<String, dynamic>? _cita;
  bool _cargando = true;
  String? _error;

  final _formKey = GlobalKey<FormState>();
  final TextEditingController _descripcionCtrl = TextEditingController();
  String _estadoSeleccionado = "Pendiente";

  @override
  void initState() {
    super.initState();
    _fetchCita();
  }

  // Obtener información de la cita (usando idMascota y filtrando por idCita)
  Future<void> _fetchCita() async {
    setState(() {
      _cargando = true;
      _error = null;
    });

    try {
      final res = await http.get(
        Uri.parse("$baseUrl/Citas/mascota/${widget.idMascota}"),
      );

      if (res.statusCode == 200) {
        final data = json.decode(res.body);

        if (data is List && data.isNotEmpty) {
          // Buscar la cita específica por idCita
          final cita = data.firstWhere(
            (c) => c["id"] == widget.idCita,
            orElse: () => {},
          );

          if (cita.isNotEmpty) {
            setState(() {
              _cita = cita;
              _descripcionCtrl.text = cita["descripcion"] ?? "";
              _estadoSeleccionado = cita["estado"] ?? "Pendiente";
            });
          } else {
            setState(() {
              _error = "No se encontró la cita con id ${widget.idCita}.";
            });
          }
        } else {
          setState(() {
            _error = "No hay citas registradas para esta mascota.";
          });
        }
      } else {
        setState(() {
          _error = "Error al obtener la información (${res.statusCode}).";
        });
      }
    } catch (e) {
      setState(() {
        _error = "Error de conexión con el servidor.";
      });
    }

    setState(() {
      _cargando = false;
    });
  }

  // Actualizar cita en backend (usa idCita)
  Future<void> _actualizarCita() async {
    if (_cita == null) return;
    if (!_formKey.currentState!.validate()) return;

    final body = {
      "estado": _estadoSeleccionado,
      "descripcion": _descripcionCtrl.text,
    };

    try {
      final res = await http.put(
        Uri.parse("$baseUrl/Citas/Actualizar/${widget.idCita}"),
        headers: {"Content-Type": "application/json"},
        body: json.encode(body),
      );

      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Cita actualizada correctamente ✅")),
        );
        _fetchCita(); // refrescar datos
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("Error al actualizar cita: ${res.statusCode}")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Error de conexión ❌")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_cargando) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Detalle de Cita"), backgroundColor: rojo),
        body: Center(child: Text(_error!)),
      );
    }

    if (_cita == null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Detalle de Cita"), backgroundColor: rojo),
        body: const Center(child: Text("No hay información disponible de la cita.")),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text("Detalle de Cita"),
        backgroundColor: rojo,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              // Info mascota y cita
              Card(
                elevation: 4,
                child: ListTile(
                  title: Text("Servicio: ${_cita?["servicio"] ?? "-"}"),
                  subtitle: Text(
                    "Fecha: ${_cita?["fecha"] ?? "-"}\n"
                    "Hora: ${_cita?["hora"] ?? "-"}\n"
                    "Mascota: ${_cita?["mascota_nombre"] ?? "-"}\n"
                    "Especie: ${_cita?["especie"] ?? "-"}\n"
                    "Raza: ${_cita?["raza"] ?? "-"}\n"
                    "Tutor: ${_cita?["cliente"] ?? "-"}",
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Campo estado
              DropdownButtonFormField<String>(
                value: _estadoSeleccionado,
                decoration: const InputDecoration(labelText: "Estado"),
                items: ["Pendiente", "En Proceso", "Completado", "Cancelado"]
                    .map((e) => DropdownMenuItem(value: e, child: Text(e)))
                    .toList(),
                onChanged: (val) =>
                    setState(() => _estadoSeleccionado = val ?? "Pendiente"),
              ),
              const SizedBox(height: 10),

              // Campo descripción
              TextFormField(
                controller: _descripcionCtrl,
                decoration: const InputDecoration(labelText: "Descripción"),
                maxLines: 3,
                validator: (val) =>
                    val == null || val.isEmpty ? "Ingrese la descripción" : null,
              ),
              const SizedBox(height: 20),

              ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: rojo,
                  foregroundColor: Colors.white,
                ),
                onPressed: _actualizarCita,
                icon: const Icon(Icons.save),
                label: const Text("Guardar cambios"),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
