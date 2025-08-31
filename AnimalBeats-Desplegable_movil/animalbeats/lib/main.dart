import 'dart:async';
import 'package:flutter/material.dart';
import 'login_registro.dart'; // Importa tus pantallas de login y registro

void main() {
  runApp(const AnimalBeatsApp());
}

class AnimalBeatsApp extends StatelessWidget {
  const AnimalBeatsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: "AnimalBeats",
      debugShowCheckedModeBanner: false,
      theme: ThemeData(primarySwatch: Colors.red),
      home: const IndexPage(),
    );
  }
}

// ---------------------- INDEX ----------------------
class IndexPage extends StatelessWidget {
  const IndexPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey[100],
      body: Column(
        children: [
          // ================= HEADER =================
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            color: Colors.red.shade900,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // LOGO
                Row(
                  children: [
                    Image.asset(
                      "img/logo-corto.png",
                      height: 40,
                    ),
                    const SizedBox(width: 10),
                    const Text(
                      "AnimalBeats",
                      style: TextStyle(
                        fontSize: 22,
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                // Botones Login y Registro
                Row(
                  children: [
                    TextButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => LoginPage()),
                        );
                      },
                      child: const Text("Login",
                          style: TextStyle(color: Colors.white)),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: () {
                        Navigator.push(
                          context,
                          MaterialPageRoute(builder: (context) => RegistroPage()),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text("Registro"),
                    ),
                  ],
                )
              ],
            ),
          ),

          // ================= CONTENIDO =================
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  // Slider de imágenes
                  const ImageSlider(),
                  const SizedBox(height: 20),

                  // ===== GRID RESPONSIVE DE CARDS =====
                  LayoutBuilder(
                    builder: (context, constraints) {
                      int cross = 1;
                      if (constraints.maxWidth >= 1100) {
                        cross = 3;
                      } else if (constraints.maxWidth >= 700) {
                        cross = 2;
                      }

                      return GridView.count(
                        crossAxisCount: cross,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisSpacing: 16,
                        mainAxisSpacing: 16,
                        childAspectRatio: 4 / 3,
                        children: const [
                          _CardServicios(),
                          _CardImportancia(),
                          _CardNovedades(),
                        ],
                      );
                    },
                  ),
                ],
              ),
            ),
          ),

          // ================= FOOTER =================
          Container(
            padding: const EdgeInsets.all(15),
            color: Colors.red.shade900,
            child: const Column(
              children: [
                Text(
                  "Contacto: contacto@animalbeats.com",
                  style: TextStyle(color: Colors.white, fontSize: 14),
                ),
                SizedBox(height: 5),
                Text(
                  "© 2025 AnimalBeats - Todos los derechos reservados",
                  style: TextStyle(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ================== CARDS ==================

class _CardServicios extends StatelessWidget {
  const _CardServicios();

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Imagen principal
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(
                "img/siberiano.jpg",
                fit: BoxFit.cover,
                width: double.infinity,
                height: 150,
              ),
            ),

            const SizedBox(height: 12),

            // Título
            const Text(
              "Servicios",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),

            const SizedBox(height: 6),

            // Descripción
            const Text(
              "Agenda de citas, recordatorios de vacunas, historial de mascotas y alertas automáticas para veterinarios.",
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}


class _CardImportancia extends StatelessWidget {
  const _CardImportancia();

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.info_outline, size: 48, color: Colors.blueAccent),
            const SizedBox(height: 12),
            const Text(
              "Importancia del proyecto",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            Expanded(
              child: Container(
                width: double.infinity,
                alignment: Alignment.topCenter,
                padding: const EdgeInsets.only(top: 8),
                child: const Text(
                  "AnimalBeats es un sistema administraivo para las veterinarias, el impacto que tiene es llevar un mejor orden en los clientes y mascotas que interactuen con la veterinaria.",
                  textAlign: TextAlign.center,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CardNovedades extends StatelessWidget {
  const _CardNovedades();

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            const Icon(Icons.campaign, size: 48, color: Colors.orange),
            const SizedBox(height: 12),
            const Text(
              "Novedades",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 6),
            const Expanded(
              child: Text(
                "Próximas funciones, eventos, lanzamientos o testimonios. Podemos cambiar esta card cuando lo definas.",
                textAlign: TextAlign.center,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ================== SLIDER ==================
class ImageSlider extends StatefulWidget {
  const ImageSlider({super.key});

  @override
  _ImageSliderState createState() => _ImageSliderState();
}

class _ImageSliderState extends State<ImageSlider> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  final List<String> images = [
    "img/banner_gato.jpg",
    "img/banner_perro.jpg",
    "img/banner_perrogato.png",
    "img/patitas.png",
    // más imágenes si quieren
  ];

  @override
  void initState() {
    super.initState();

    // Cambiar de pagina automáticamente
    Timer.periodic(const Duration(seconds: 3), (Timer timer) {
      if (!mounted) return;
      if (_currentPage < images.length - 1) {
        _currentPage++;
      } else {
        _currentPage = 0;
      }

      if (_pageController.hasClients) {
        _pageController.animateToPage(
          _currentPage,
          duration: const Duration(milliseconds: 400),
          curve: Curves.easeInOut,
        );
      }
    });
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Slider
        SizedBox(
          height: 200,
          child: PageView.builder(
            controller: _pageController,
            itemCount: images.length,
            itemBuilder: (context, index) {
              return ClipRRect(
                borderRadius: BorderRadius.circular(15),
                child: Image.asset(
                  images[index],
                  fit: BoxFit.cover,
                  width: double.infinity,
                ),
              );
            },
          ),
        ),

        // Indicadores (puntitos)
        const SizedBox(height: 10),
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(images.length, (index) {
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: _currentPage == index ? 12 : 8,
              height: _currentPage == index ? 12 : 8,
              decoration: BoxDecoration(
                color: _currentPage == index ? Colors.red : Colors.grey,
                shape: BoxShape.circle,
              ),
            );
          }),
        ),
      ],
    );
  }
}
