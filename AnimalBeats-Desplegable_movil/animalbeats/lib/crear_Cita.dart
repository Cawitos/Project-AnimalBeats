import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';

const String baseUrl = "https://animalbeats-api.onrender.com";

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
  DateTime? selectedDate;
  TimeOfDay? selectedTime;
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
    try {
      final response = await http.get(Uri.parse("$baseUrl/mascotas"));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        setState(() {
          mascotas = data.where((m) => m["id_cliente"].toString() == documento).toList();
        });
      }
    } catch (e) {
      print("Error fetching mascotas: $e");
    }
  }

  Future<void> _fetchServicios() async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/servicios/Listado"));
      if (response.statusCode == 200) {
        setState(() {
          servicios = json.decode(response.body);
        });
      }
    } catch (e) {
      print("Error fetching servicios: $e");
    }
  }

  Future<void> _fetchVeterinarios() async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/veterinarios"));
      if (response.statusCode == 200) {
        setState(() {
          veterinarios = json.decode(response.body);
        });
      }
    } catch (e) {
      print("Error fetching veterinarios: $e");
    }
  }

  Future<void> _fetchCitas() async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/Citas/Listado"));
      if (response.statusCode == 200) {
        setState(() {
          citas = json.decode(response.body);
        });
      }
    } catch (e) {
      print("Error fetching citas: $e");
    }
  }

  Future<void> _registrarCita() async {
    if (selectedDate == null || selectedTime == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ Debe seleccionar fecha y hora")),
      );
      return;
    }

    // Combinar fecha y hora
    final fechaCompleta = DateTime(
      selectedDate!.year,
      selectedDate!.month,
      selectedDate!.day,
      selectedTime!.hour,
      selectedTime!.minute,
    );

    final formattedDate = DateFormat("yyyy-MM-dd HH:mm:ss").format(fechaCompleta);
    final estado = widget.userRole == 2 ? "Solicitud" : "Pendiente";
    
    // CORREGIDO: Usar los mismos nombres de campo que en React
    final body = {
      "id_mascota": selectedMascotaId, // Cambiado de "id_Mascota" a "id_mascota"
      "id_cliente": widget.userRole == 2 ? widget.nDocumento : documentoCtrl.text,
      "id_servicio": selectedServicioId, // Cambiado de "id_Servicio" a "id_servicio"
      "id_veterinario": selectedVeterinarioId,
      "fecha": formattedDate,
      "descripcion": descripcion, // Cambiado de "Descripcion" a "descripcion"
      "estado": estado,
    };

    print("Enviando datos: $body"); // Para debug

    try {
      final response = await http.post(
        Uri.parse("$baseUrl/Citas/Registrar"),
        headers: {"Content-Type": "application/json"},
        body: json.encode(body),
      );

      print("Respuesta del servidor: ${response.statusCode}");
      print("Body de respuesta: ${response.body}");

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
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("❌ Error de conexión: $e")),
      );
    }
  }

  List<String> _getHorasDisponibles(String fechaSeleccionada) {
    final horas = [
      "07:00", "07:30", "08:00", "08:30", "09:00", "09:30",
      "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
      "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
      "16:00", "16:30", "17:00", "17:30"
    ];

    List<String> disponibles = [];

    for (var hora in horas) {
      try {
        final fechaParts = fechaSeleccionada.split('-');
        final horaParts = hora.split(':');
        
        final intento = DateTime(
          int.parse(fechaParts[0]),
          int.parse(fechaParts[1]),
          int.parse(fechaParts[2]),
          int.parse(horaParts[0]),
          int.parse(horaParts[1]),
        );

        bool ocupada = citas.any((c) {
          if (selectedVeterinarioId == null) return false;
          
          try {
            String fechaCita = c['fecha']?.toString() ?? '';
            if (fechaCita.isEmpty) return false;
            
            fechaCita = fechaCita.replaceAll('T', ' ').split('.')[0];
            DateTime cFecha = DateTime.parse(fechaCita);
            
            return c['id_veterinario'].toString() == selectedVeterinarioId &&
                   cFecha.isAtSameMomentAs(intento);
          } catch (e) {
            print("Error parsing cita fecha: $e");
            return false;
          }
        });
        
        if (!ocupada) disponibles.add(hora);
      } catch (e) {
        print("Error procesando hora $hora: $e");
      }
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
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                "Seleccionar hora",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: negro,
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  shrinkWrap: true,
                  children: horasDisponibles.map((h) {
                    return ListTile(
                      title: Text(
                        h,
                        style: TextStyle(
                          fontSize: 16,
                          color: negro,
                        ),
                      ),
                      onTap: () => Navigator.pop(context, h),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );

    if (horaSeleccionada != null) {
      setState(() {
        selectedDate = date;
        final parts = horaSeleccionada.split(":");
        selectedTime = TimeOfDay(
          hour: int.parse(parts[0]),
          minute: int.parse(parts[1]),
        );
      });
    }
  }

  void _seleccionarHoraIndividual() async {
    if (selectedDate == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("❌ Primero seleccione una fecha")),
      );
      return;
    }

    final fechaStr = DateFormat("yyyy-MM-dd").format(selectedDate!);
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
        return Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                "Seleccionar hora",
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: negro,
                ),
              ),
              const SizedBox(height: 16),
              Expanded(
                child: ListView(
                  shrinkWrap: true,
                  children: horasDisponibles.map((h) {
                    return ListTile(
                      title: Text(
                        h,
                        style: TextStyle(
                          fontSize: 16,
                          color: negro,
                        ),
                      ),
                      onTap: () => Navigator.pop(context, h),
                    );
                  }).toList(),
                ),
              ),
            ],
          ),
        );
      },
    );

    if (horaSeleccionada != null) {
      setState(() {
        final parts = horaSeleccionada.split(":");
        selectedTime = TimeOfDay(
          hour: int.parse(parts[0]),
          minute: int.parse(parts[1]),
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
        if (selectedDate == null || selectedTime == null) error = "Debe seleccionar fecha y hora";
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

  String _getFechaHoraTexto() {
    if (selectedDate == null && selectedTime == null) {
      return "Seleccionar fecha y hora";
    } else if (selectedDate != null && selectedTime == null) {
      return "Fecha: ${DateFormat('dd/MM/yyyy').format(selectedDate!)} - Falta hora";
    } else if (selectedDate == null && selectedTime != null) {
      return "Hora: ${selectedTime!.format(context)} - Falta fecha";
    } else {
      return "📅 ${DateFormat('dd/MM/yyyy').format(selectedDate!)} ⏰ ${selectedTime!.format(context)}";
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
                // Selector de fecha y hora
                GestureDetector(
                  onTap: _seleccionarFecha,
                  child: Card(
                    color: rojo,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 4,
                    child: Padding(
                      padding: const EdgeInsets.all(16.0),
                      child: Row(
                        children: [
                          const Icon(Icons.calendar_today, color: blanco, size: 28),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              _getFechaHoraTexto(),
                              style: const TextStyle(
                                color: blanco, 
                                fontWeight: FontWeight.bold,
                                fontSize: 16,
                              ),
                            ),
                          ),
                          const Icon(Icons.arrow_drop_down, color: blanco, size: 28),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                // Botón para cambiar solo la hora
                if (selectedDate != null)
                  OutlinedButton.icon(
                    onPressed: _seleccionarHoraIndividual,
                    icon: const Icon(Icons.access_time, color: rojo),
                    label: const Text("Cambiar hora", style: TextStyle(color: rojo)),
                    style: OutlinedButton.styleFrom(
                      side: const BorderSide(color: rojo),
                    ),
                  ),
                const SizedBox(height: 20),
                // Campo de descripción
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
                    contentPadding: const EdgeInsets.all(16),
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
    if (mascotas.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text("No se encontraron mascotas", textAlign: TextAlign.center),
      );
    }

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
            title: Text(
              m["nombre"] ?? "Sin nombre", 
              style: const TextStyle(color: negro)
            ),
            subtitle: Text(
              "${m["especie"] ?? ""} - ${m["raza"] ?? ""}",
              style: const TextStyle(color: negro),
            ),
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
    if (servicios.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text("No se encontraron servicios", textAlign: TextAlign.center),
      );
    }

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
            title: Text(
              s["servicio"] ?? "Sin nombre", 
              style: const TextStyle(color: negro)
            ),
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
    if (veterinarios.isEmpty) {
      return const Padding(
        padding: EdgeInsets.all(16.0),
        child: Text("No se encontraron veterinarios", textAlign: TextAlign.center),
      );
    }

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
                      errorBuilder: (context, error, stackTrace) {
                        return const Icon(Icons.person, color: negro);
                      },
                    ),
                  )
                : const Icon(Icons.person, color: negro),
            title: Text(
              v["nombre_completo"] ?? "Sin nombre", 
              style: const TextStyle(color: negro)
            ),
            subtitle: Text(
              "${v["estudios_especialidad"] ?? ""} • ${v["anios_experiencia"] ?? ""} años",
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

