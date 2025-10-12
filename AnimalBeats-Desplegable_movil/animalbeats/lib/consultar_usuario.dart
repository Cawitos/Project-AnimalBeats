import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:pdf/widgets.dart' as pw;
import 'package:pdf/pdf.dart';
import 'package:printing/printing.dart';
import 'package:flutter/services.dart' show rootBundle;

const String apiUrl = "https://animalbeats-api.onrender.com";

class ConsultarUsuarioPage extends StatefulWidget {
  final String documento;
  const ConsultarUsuarioPage({super.key, required this.documento});

  @override
  _ConsultarUsuarioPageState createState() => _ConsultarUsuarioPageState();
}

class _ConsultarUsuarioPageState extends State<ConsultarUsuarioPage> {
  Map<String, dynamic>? usuario;
  bool loading = true;
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchUsuario();
  }

  Future<void> _fetchUsuario() async {
    try {
      final response =
          await http.get(Uri.parse("$apiUrl/usuario/${widget.documento}"));

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);

        setState(() {
          if (data is Map && data.containsKey("n_documento")) {
            usuario = Map<String, dynamic>.from(data);
          } else if (data is String && data == "Usuario no encontrado") {
            error = "Usuario no encontrado.";
          } else {
            error = "Formato inesperado en la respuesta: $data";
          }
          loading = false;
        });
      } else {
        setState(() {
          error = "Error del servidor: ${response.statusCode}";
          loading = false;
        });
      }
    } catch (e) {
      setState(() {
        error = "Error de conexión: $e";
        loading = false;
      });
    }
  }

  /// 🔽 Método para generar y descargar el PDF
  Future<void> _descargarUsuarioPDF(Map<String, dynamic> usuario) async {
    final pdf = pw.Document();

    final logo = pw.MemoryImage(
      (await rootBundle.load('img/logo.png')).buffer.asUint8List(),
    );

    final fechaHoraDescarga = DateTime.now();

    pdf.addPage(
      pw.MultiPage(
        margin: const pw.EdgeInsets.all(24),
        build: (context) => [
          pw.Row(
            mainAxisAlignment: pw.MainAxisAlignment.spaceBetween,
            children: [
              pw.Image(logo, height: 60),
              pw.Column(
                crossAxisAlignment: pw.CrossAxisAlignment.end,
                children: [
                  pw.Text("Ficha de Usuario",
                      style: pw.TextStyle(
                          fontSize: 20, fontWeight: pw.FontWeight.bold)),
                  pw.Text(
                      "Descargado el: ${fechaHoraDescarga.toLocal().toString().split('.')[0]}",
                      style: const pw.TextStyle(fontSize: 10)),
                ],
              ),
            ],
          ),
          pw.Divider(),
          pw.SizedBox(height: 20),
          pw.Text("Información del Usuario",
              style:
                  pw.TextStyle(fontSize: 14, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 10),
          pw.Table.fromTextArray(
            border: pw.TableBorder.all(color: PdfColors.red, width: 1),
            headerStyle: pw.TextStyle(
                fontWeight: pw.FontWeight.bold, color: PdfColors.white),
            headerDecoration: const pw.BoxDecoration(color: PdfColors.red),
            cellAlignment: pw.Alignment.centerLeft,
            headers: ["Campo", "Valor"],
            data: [
              ["Nombre", usuario["nombre"] ?? "-"],
              [
                "Documento",
                "${usuario["tipo_documento"]} - ${usuario["n_documento"]}"
              ],
              ["Correo", usuario["correoelectronico"] ?? "-"],
            ],
          ),
        ],
      ),
    );

    await Printing.layoutPdf(
      onLayout: (format) async => pdf.save(),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (error != null) {
      return Scaffold(
        appBar: AppBar(title: const Text("Consultar Usuario")),
        body: Center(
          child: Text(
            error!,
            style: const TextStyle(color: Colors.red, fontSize: 18),
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(
          "Usuario ${usuario!["n_documento"]}",
          style: TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.red,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Card(
          elevation: 4,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text("📛 Nombre: ${usuario!["nombre"]}",
                    style: const TextStyle(fontSize: 18)),
                const SizedBox(height: 10),
                Text(
                  "🆔 Documento: ${usuario!["tipo_documento"]} - ${usuario!["n_documento"]}",
                  style: const TextStyle(fontSize: 18),
                ),
                const SizedBox(height: 10),
                Text("📧 Correo: ${usuario!["correoelectronico"]}",
                    style: const TextStyle(fontSize: 18)),
              ],
            ),
          ),
        ),
      ),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.orange,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () async {
                try {
                  final response = await http.put(
                    Uri.parse(
                        "$apiUrl/usuario/Pendiente/${usuario!["n_documento"]}"),
                  );

                  if (response.statusCode == 200) {
                    final data = jsonDecode(response.body);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                          content:
                              Text(data["mensaje"] ?? "Usuario en pendiente")),
                    );
                    Navigator.pop(context, true);
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text("Error al cambiar a pendiente")),
                    );
                  }
                } catch (e) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text("Error: $e")),
                  );
                }
              },
              child: const Text(
                "Poner en Pendiente",
                style: TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () => _descargarUsuarioPDF(usuario!),
              icon: const Icon(Icons.download, color: Colors.white),
              label: const Text(
                "Descargar PDF",
                style: TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),
            const SizedBox(height: 10),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red,
                padding: const EdgeInsets.symmetric(vertical: 14),
              ),
              onPressed: () => Navigator.pop(context),
              child: const Text(
                "Volver",
                style: TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
