// ignore_for_file: unused_element

import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

const String baseUrl = "https://animalbeats-backend-production.up.railway.app";

const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const Color gris = Color(0xFFE6E8E6);
const Color negro = Color(0xFF07090F);

class CrearCitaStepper extends StatefulWidget {
  final int userRole;
  final String nDocumento;

  const CrearCitaStepper({
    super.key,
    required this.userRole,
    required this.nDocumento,
  });

  @override
  State<CrearCitaStepper> createState() => _CrearCitaStepperState();
}

class _CrearCitaStepperState extends State<CrearCitaStepper> {
  int _currentStep = 0;

  List<dynamic> mascotas = [];
  List<dynamic> servicios = [];
  List<dynamic> veterinarios = [];
  List<dynamic> citas = [];

  String? selectedMascotaId;
  String? selectedServicioId;
  String? selectedVeterinarioId;
  DateTime? selectedDateTime;
  String descripcion = "";

  TextEditingController documentoCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    _fetchServicios();
    _fetchVeterinarios();
    _fetchCitas();
    if (widget.userRole == 2) {
      _fetchMascotas(widget.nDocumento);
    }
  }

  Future<void> _fetchMascotas(String documento) async {
    final response = await http.get(Uri.parse("$baseUrl/mascotas"));
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      setState(() {
        mascotas =
            data.where((m) => m["id_cliente"].toString() == documento).toList();
      });
    }
  }

  Future<void> _fetchServicios() async {
    final response = await http.get(Uri.parse("$baseUrl/servicios/Listado"));
    if (response.statusCode == 200) {
      setState(() {
        servicios = json.decode(response.body);
      });
    }
  }

  Future<void> _fetchVeterinarios() async {
    final response = await http.get(Uri.parse("$baseUrl/veterinarios"));
    if (response.statusCode == 200) {
      setState(() {
        veterinarios = json.decode(response.body);
      });
    }
  }

  Future<void> _fetchCitas() async {
    final response = await http.get(Uri.parse("$baseUrl/Citas/Listado"));
    if (response.statusCode == 200) {
      setState(() {
        citas = json.decode(response.body);
      });
    }
  }

  Future<void> _registrarCita() async {
    final estado = widget.userRole == 2 ? "Solicitud" : "Pendiente";
    final formattedDate = DateFormat("yyyy-MM-dd HH:mm:ss").format(selectedDateTime!);
    final body = {
      "id_Mascota": selectedMascotaId,
      "id_cliente": widget.userRole == 2 ? widget.nDocumento : documentoCtrl.text,
      "id_Servicio": selectedServicioId,
      "id_veterinario": selectedVeterinarioId,
      "fecha": formattedDate,
      "Descripcion": descripcion,
      "estado": estado,
    };

    final response = await http.post(
      Uri.parse("$baseUrl/Citas/Registrar"),
      headers: {"Content-Type": "application/json"},
      body: json.encode(body),
    );

    if (response.statusCode == 201) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("✅ Cita registrada correctamente")),
      );
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("❌ Error al registrar la cita: ${response.body}")),
      );
    }
  }

  List<String> _getHorasDisponibles(String fechaSeleccionada) {
    // Horas disponibles
    final horas = [
      "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
      "16:00", "16:30", "17:00", "17:30"
    ];

    final dateFormat = DateFormat("yyyy-MM-dd HH:mm");
    List<String> disponibles = [];

    for (var hora in horas) {
      final intento = dateFormat.parse("$fechaSeleccionada $hora");
      bool ocupada = citas.any((c) {
        if (selectedVeterinarioId == null) return false;
        final cFecha = DateFormat("yyyy-MM-dd HH:mm")
            .parse(c['fecha'].toString().substring(0, 16));
        return c['id_veterinario'].toString() == selectedVeterinarioId &&
               cFecha.isAtSameMomentAs(intento);
      });
      if (!ocupada) disponibles.add(hora);
    }

    return disponibles;
  }

  void _seleccionarFecha() async {
    DateTime? date = await showDatePicker(
      context: context,
      firstDate: DateTime.now(),
      lastDate: DateTime(2100),
      initialDate: DateTime.now(),
    );
    if (date == null) return;

    final fechaStr = DateFormat("yyyy-MM-dd").format(date);
    final horasDisponibles = _getHorasDisponibles(fechaStr);

    if (horasDisponibles.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ No hay horas disponibles para esta fecha")),
      );
      return;
    }

    String? horaSeleccionada = await showModalBottomSheet<String>(
      context: context,
      builder: (context) {
        return ListView(
          shrinkWrap: true,
          children: horasDisponibles.map((h) {
            return ListTile(
              title: Text(h),
              onTap: () => Navigator.pop(context, h),
            );
          }).toList(),
        );
      },
    );

    if (horaSeleccionada != null) {
      setState(() {
        final parts = horaSeleccionada.split(":");
        selectedDateTime = DateTime(
          date.year,
          date.month,
          date.day,
          int.parse(parts[0]),
          int.parse(parts[1]),
        );
      });
    }
  }

  void _validarPaso(int step) {
    String? error;
    switch (step) {
      case 0:
        if (selectedMascotaId == null) error = "Debe seleccionar una mascota";
        break;
      case 1:
        if (selectedServicioId == null) error = "Debe seleccionar un servicio";
        break;
      case 2:
        if (selectedVeterinarioId == null) error = "Debe seleccionar un veterinario";
        break;
      case 3:
        if (selectedDateTime == null) error = "Debe seleccionar fecha y hora";
        break;
    }

    if (error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error)),
      );
    } else {
      if (step == 3) {
        _registrarCita();
      } else {
        setState(() => _currentStep += 1);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: blanco,
      appBar: AppBar(
        title: const Text("Registrar Cita"),
        backgroundColor: rojo,
        foregroundColor: blanco,
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () => _validarPaso(_currentStep),
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() => _currentStep -= 1);
          }
        },
        controlsBuilder: (context, details) {
          return Row(
            children: [
              ElevatedButton(
                onPressed: details.onStepContinue,
                style: ElevatedButton.styleFrom(
                  backgroundColor: rojo,
                  foregroundColor: blanco,
                ),
                child: Text(_currentStep == 3 ? "Finalizar" : "Siguiente"),
              ),
              const SizedBox(width: 8),
              if (_currentStep > 0)
                OutlinedButton(
                  onPressed: details.onStepCancel,
                  style: OutlinedButton.styleFrom(
                    foregroundColor: rojo,
                    side: const BorderSide(color: rojo),
                  ),
                  child: const Text("Atrás"),
                ),
            ],
          );
        },
        steps: [
          Step(
            title: const Text("Mascota"),
            content: widget.userRole == 2
                ? _buildMascotasList()
                : Column(
                    children: [
                      TextField(
                        controller: documentoCtrl,
                        decoration: const InputDecoration(
                          labelText: "Documento del cliente",
                          border: OutlineInputBorder(),
                        ),
                      ),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: () => _fetchMascotas(documentoCtrl.text),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: rojo,
                          foregroundColor: blanco,
                        ),
                        child: const Text("Buscar"),
                      ),
                      _buildMascotasList(),
                    ],
                  ),
          ),
          Step(
            title: const Text("Servicio"),
            content: _buildServiciosList(),
          ),
          Step(
            title: const Text("Veterinario"),
            content: _buildVeterinariosList(),
          ),
          Step(
            title: const Text("Fecha y Descripción"),
            content: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                GestureDetector(
                  onTap: _seleccionarFecha,
                  child: Card(
                    color: rojo,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(12.0),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, color: blanco, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              selectedDateTime != null
                                  ? "📅 ${selectedDateTime!.day}/${selectedDateTime!.month}/${selectedDateTime!.year} "
                                      "⏰ ${selectedDateTime!.hour}:${selectedDateTime!.minute.toString().padLeft(2, '0')}"
                                  : "Seleccionar fecha y hora",
                              style: const TextStyle(
                                  color: blanco, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
                TextField(
                  onChanged: (val) => descripcion = val,
                  decoration: InputDecoration(
                    labelText: "Descripción de la cita",
                    filled: true,
                    fillColor: gris,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                  ),
                  maxLines: 3,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMascotasList() {
    return Column(
      children: mascotas.map((m) {
        final isSelected = selectedMascotaId == m["id"].toString();
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: gris,
            borderRadius: BorderRadius.circular(12),
            border: isSelected ? Border.all(color: rojo, width: 2) : null,
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: rojo.withOpacity(0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
            ],
          ),
          child: ListTile(
            title: Text(m["nombre"], style: const TextStyle(color: negro)),
            subtitle: Text("${m["especie"]} - ${m["raza"]}",
                style: const TextStyle(color: negro)),
            onTap: () {
              setState(() {
                selectedMascotaId = m["id"].toString();
              });
            },
          ),
        );
      }).toList(),
    );
  }

  Widget _buildServiciosList() {
    return Column(
      children: servicios.map((s) {
        final isSelected = selectedServicioId == s["id"].toString();
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: gris,
            borderRadius: BorderRadius.circular(12),
            border: isSelected ? Border.all(color: rojo, width: 2) : null,
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: rojo.withOpacity(0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
            ],
          ),
          child: ListTile(
            title: Text(s["servicio"], style: const TextStyle(color: negro)),
            onTap: () {
              setState(() {
                selectedServicioId = s["id"].toString();
              });
            },
          ),
        );
      }).toList(),
    );
  }

  Widget _buildVeterinariosList() {
    return Column(
      children: veterinarios.map((v) {
        final isSelected = selectedVeterinarioId == v["id"].toString();
        return AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          margin: const EdgeInsets.symmetric(vertical: 6),
          decoration: BoxDecoration(
            color: gris,
            borderRadius: BorderRadius.circular(12),
            border: isSelected ? Border.all(color: rojo, width: 2) : null,
            boxShadow: [
              if (isSelected)
                BoxShadow(
                  color: rojo.withOpacity(0.3),
                  blurRadius: 6,
                  offset: const Offset(0, 3),
                ),
            ],
          ),
          child: ListTile(
            leading: v["imagen_url"] != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(20),
                    child: Image.network(
                      v["imagen_url"],
                      width: 40,
                      height: 40,
                      fit: BoxFit.cover,
                    ),
                  )
                : const Icon(Icons.person, color: negro),
            title: Text(v["nombre_completo"], style: const TextStyle(color: negro)),
            subtitle: Text(
              "${v["estudios_especialidad"]} • ${v["anios_experiencia"]} años",
              style: const TextStyle(color: negro),
            ),
            onTap: () {
              setState(() {
                selectedVeterinarioId = v["id"].toString();
              });
            },
          ),
        );
      }).toList(),
    );
  }
}
