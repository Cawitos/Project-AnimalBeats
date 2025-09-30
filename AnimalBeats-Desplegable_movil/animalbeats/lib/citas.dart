import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'crear_Cita.dart';
import 'menu.dart';

const Color rojo = Color(0xFFDF2935);
const Color blanco = Color(0xFFFDF7FA);
const Color gris = Color(0xFFE6E8E6);
const Color negro = Color(0xFF07090F);

class CitasPage extends StatefulWidget {
  final int userRole;
  final String? nDocumento;

  const CitasPage({
    Key? key,
    required this.userRole,
    this.nDocumento,
  }) : super(key: key);

  @override
  State<CitasPage> createState() => _CitasPageState();
}

class _CitasPageState extends State<CitasPage>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List citas = [];
  bool loading = true;

  final String baseUrl =
      "https://animalbeats-api.onrender.com/Citas/Listado";

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    fetchCitas();
  }

  Future<void> fetchCitas() async {
    try {
      final response = await http.get(Uri.parse(baseUrl));
      if (response.statusCode == 200) {
        var decoded = json.decode(response.body);

        if (decoded is Map && decoded.containsKey("mensaje")) {
          setState(() {
            citas = [];
            loading = false;
          });
          return;
        }

        List data = decoded;

        if (widget.userRole == 2 && widget.nDocumento != null) {
          data = data
              .where((c) => c['id_cliente'].toString() == widget.nDocumento)
              .toList();
        }

        setState(() {
          citas = data;
          loading = false;
        });
      } else {
        throw Exception("Error al cargar citas");
      }
    } catch (e) {
      setState(() {
        loading = false;
      });
    }
  }

  List filterCitas(String filtro) {
    if (filtro == "Terminadas") {
      return citas
          .where((c) =>
              c['estado'] == "Completado" || c['estado'] == "Cancelado")
          .toList();
    }
    return citas.where((c) => c['estado'] == filtro).toList();
  }

  String formatFecha(String? fecha) {
    if (fecha == null || fecha.isEmpty) return "Sin fecha";
    try {
      DateTime f = DateTime.parse(fecha).toLocal();
      return DateFormat("d 'de' MMMM 'de' y, h:mm a", "es_ES").format(f);
    } catch (_) {
      return fecha;
    }
  }

  Future<void> _cambiarEstado(int id, String nuevoEstado) async {
    try {
      final response = await http.put(
        Uri.parse(
            "https://animalbeats-api.onrender.com/Citas/$nuevoEstado/$id"),
      );
      if (response.statusCode == 200) {
        fetchCitas();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text("✅ Cita actualizada a $nuevoEstado")),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("❌ No se pudo actualizar la cita")),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("❌ Error al actualizar la cita: $e")),
      );
    }
  }

  Widget buildCitaCard(Map cita) {
    Color estadoColor = cita['estado'] == "Pendiente"
        ? rojo
        : cita['estado'] == "Solicitud"
            ? Colors.orange
            : cita['estado'] == "Completado"
                ? Colors.green
                : rojo;

    return Card(
      color: blanco,
      margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      elevation: 3,
      child: ListTile(
        contentPadding: const EdgeInsets.all(16),
        title: Text(
          cita['nombre_servicio'] ?? "Sin servicio",
          style: const TextStyle(
            fontWeight: FontWeight.bold,
            fontSize: 16,
            color: negro,
          ),
        ),
        subtitle: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 6),
            Text("Mascota: ${cita['nombre_mascota'] ?? 'Desconocida'}"),
            Text("Cliente: ${cita['nombre_cliente'] ?? ''}"),
            Text("Veterinario: ${cita['nombre_veterinario'] ?? ''}"),
            Text("Fecha: ${formatFecha(cita['fecha'])}"),
            const SizedBox(height: 6),
            Text(
              "Estado: ${cita['estado'] ?? ''}",
              style: TextStyle(
                color: estadoColor,
                fontWeight: FontWeight.w600,
              ),
            ),
            if (cita['Descripcion'] != null &&
                cita['Descripcion'].toString().isNotEmpty)
              Text("Descripción: ${cita['Descripcion']}"),
            const SizedBox(height: 8),
            // Botones dinámicos según estado
            if (cita['estado'] == "Pendiente")
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: rojo),
                onPressed: () => _cambiarEstado(cita['id'], "Cancelar"),
                child: const Text("Cancelar", style: TextStyle(color: blanco)),
              ),
            if (cita['estado'] == "Solicitud")
              ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.green),
                onPressed: () => _cambiarEstado(cita['id'], "Pendiente"),
                child:
                    const Text("Confirmar", style: TextStyle(color: blanco)),
              ),
          ],
        ),
        trailing: const Icon(Icons.arrow_forward_ios, size: 18, color: negro),
      ),
    );
  }

  Widget buildTerminadas() {
    List terminadas = filterCitas("Terminadas");

    Map<String, List> citasPorFecha = {};
    for (var c in terminadas) {
      String fecha = c['fecha'] ?? "Sin fecha";
      String fechaBonita = formatFecha(fecha);
      if (!citasPorFecha.containsKey(fechaBonita)) {
        citasPorFecha[fechaBonita] = [];
      }
      citasPorFecha[fechaBonita]!.add(c);
    }

    return ListView(
      children: citasPorFecha.entries.map((entry) {
        String fecha = entry.key;
        List listaCitas = entry.value;

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
              child: Text(
                fecha,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: negro,
                ),
              ),
            ),
            ...listaCitas.map((c) => buildCitaCard(c)).toList(),
          ],
        );
      }).toList(),
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: gris,
      drawer: OffcanvasMenu(
        userRole: widget.userRole,
        nDocumento: widget.nDocumento,
      ),
      appBar: AppBar(
        backgroundColor: rojo,
        title: const Text("Citas", style: TextStyle(color: blanco)),
        centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: blanco,
          labelColor: blanco,
          unselectedLabelColor: blanco.withOpacity(0.7),
          tabs: const [
            Tab(text: "Pendiente"),
            Tab(text: "Solicitud"),
            Tab(text: "Terminadas"),
          ],
        ),
      ),
      body: loading
          ? const Center(child: CircularProgressIndicator(color: rojo))
          : TabBarView(
              controller: _tabController,
              children: [
                citas.isEmpty
                    ? const Center(child: Text("No hay citas"))
                    : ListView(
                        children: filterCitas("Pendiente")
                            .map((c) => buildCitaCard(c))
                            .toList(),
                      ),
                citas.isEmpty
                    ? const Center(child: Text("No hay citas"))
                    : ListView(
                        children: filterCitas("Solicitud")
                            .map((c) => buildCitaCard(c))
                            .toList(),
                      ),
                citas.isEmpty
                    ? const Center(child: Text("No hay citas"))
                    : buildTerminadas(),
              ],
            ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: rojo,
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => CrearCitaStepper(
                userRole: widget.userRole,
                nDocumento: widget.nDocumento ?? "",
              ),
            ),
          );
          fetchCitas();
        },
        child: const Icon(Icons.add, color: blanco),
      ),
    );
  }
}
