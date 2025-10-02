import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'gestion_mascotas.dart';

const String baseUrl = "https://animalbeats-api.onrender.com";
const Color rojo = Color(0xFFDF2935);

class ConfirmarCitaPage extends StatefulWidget {
  final int idCita;
  final int userRole;

  const ConfirmarCitaPage({
    super.key,
    required this.idCita,
    required this.userRole,
  });

  @override
  State<ConfirmarCitaPage> createState() => _ConfirmarCitaPageState();
}

class _ConfirmarCitaPageState extends State<ConfirmarCitaPage> {
  Map<String, dynamic>? _cita;
  bool _cargando = true;
  String? _error;

  final TextEditingController _nuevaDescripcionCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchCita();
  }

  Future<void> _fetchCita() async {
    setState(() {
      _cargando = true;
      _error = null;
    });

    try {
      final res = await http.get(Uri.parse("$baseUrl/Citas/${widget.idCita}"));

      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        setState(() {
          _cita = data;
        });
      } else {
        setState(() {
          _error = "Error al obtener cita (${res.statusCode}).";
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

  Future<void> _confirmarCita() async {
    if (_cita == null) return;

    final now = DateTime.now();
    final timestamp =
        "${now.year}-${now.month.toString().padLeft(2, '0')}-${now.day.toString().padLeft(2, '0')} "
        "${now.hour.toString().padLeft(2, '0')}:${now.minute.toString().padLeft(2, '0')}:${now.second.toString().padLeft(2, '0')}";

    final descripcionAnterior = _cita!["descripcion"] ?? "";
    final nuevaDescripcion = "$descripcionAnterior\n\n"
        "📌 Procesos dentro de la cita:\n"
        "[$timestamp] ${_nuevaDescripcionCtrl.text}";

    final body = {
      "id_mascota": _cita!["id_mascota"],
      "id_cliente": _cita!["usuarios"]?["id"] ?? _cita!["id_cliente"],
      "id_Servicio": _cita!["servicios"]?["id"] ?? _cita!["id_Servicio"],
      "id_veterinario": _cita!["veterinarios"]?["id"] ?? _cita!["id_veterinario"],
      "fecha": _cita!["fecha"],
      "descripcion": nuevaDescripcion,
      "estado": "Completado",
    };

    try {
      final res = await http.put(
        Uri.parse("$baseUrl/Citas/Actualizar/${widget.idCita}"),
        headers: {"Content-Type": "application/json"},
        body: json.encode(body),
      );

      if (res.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("✅ Cita confirmada correctamente")),
        );

        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(
            builder: (context) =>
                GestionMascotas(userRole: widget.userRole),
          ),
          (route) => false,
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
              content: Text(
                  "Error al confirmar cita (${res.statusCode}): ${res.body}")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ Error de conexión")),
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
        appBar:
            AppBar(title: const Text("Confirmar Cita"), backgroundColor: rojo),
        body: Center(child: Text(_error!)),
      );
    }

    if (_cita == null) {
      return Scaffold(
        appBar:
            AppBar(title: const Text("Confirmar Cita"), backgroundColor: rojo),
        body: const Center(child: Text("No se encontró la cita")),
      );
    }

    // Mapear datos correctamente
    final nombreMascota = _cita?["mascota"]?["nombre"] ?? "-";
    final nombreCliente = _cita?["usuarios"]?["nombre"] ?? "-";
    final nombreServicio = _cita?["servicios"]?["servicio"] ?? "-";
    final nombreVeterinario = _cita?["veterinarios"]?["nombre_completo"] ?? "-";
    final fechaCita = _cita?["fecha"] ?? "-";
    final descripcion = _cita?["descripcion"] ?? "Sin descripción";
    final estado = _cita?["estado"] ?? "-";

    return Scaffold(
      appBar: AppBar(
        title: const Text("Confirmación de Cita"),
        backgroundColor: rojo,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: ListView(
          children: [
            Card(
              elevation: 3,
              child: ListTile(
                title: Text("Mascota: $nombreMascota"),
                subtitle: Text(
                  "Cliente: $nombreCliente\n"
                  "Servicio: $nombreServicio\n"
                  "Fecha y hora: $fechaCita\n"
                  "Veterinario: $nombreVeterinario\n"
                  "Estado: $estado",
                ),
              ),
            ),
            const SizedBox(height: 20),
            Card(
              elevation: 3,
              child: ListTile(
                title: const Text("Descripción inicial"),
                subtitle: Text(descripcion),
              ),
            ),
            const SizedBox(height: 20),
            TextField(
              controller: _nuevaDescripcionCtrl,
              maxLines: 3,
              decoration: const InputDecoration(
                labelText: "Procesos dentro de la cita",
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: rojo,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
              ),
              onPressed: _confirmarCita,
              icon: const Icon(Icons.check_circle),
              label: const Text("Confirmar cita"),
            ),
          ],
        ),
      ),
    );
  }
}
