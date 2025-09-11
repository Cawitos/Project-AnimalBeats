import 'dart:async';
import 'package:flutter/material.dart';
import 'login_registro.dart'; // Importa tus pantallas de login y registro
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'dart:math';


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
            color: const Color.fromARGB(255, 151, 24, 24),
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
                        children: const [
                          _CardTestimonios(),
                          _CardTips(),
                          _CardCuriosidades(),
                        ],
                      );
                    },
                  ),
                  const SizedBox(height: 30,),
                  //seccion de los veterinarios
                  const VeterinariosPreview(),
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

//Cards interactivas?
// ================== CARD 1: TESTIMONIOS ==================
class _CardTestimonios extends StatefulWidget {
  const _CardTestimonios();

  @override
  State<_CardTestimonios> createState() => _CardTestimoniosState();
}

class _CardTestimoniosState extends State<_CardTestimonios> {
  final List<Map<String, String>> testimonios = [
    {
      "nombre": "Ana y Rocky 🐶",
      "comentario": "Gracias a AnimalBeats nunca olvido las vacunas de mi perro.",
      "foto": ""
    },
    {
      "nombre": "Carlos y Michi 🐱",
      "comentario": "El sistema me recuerda las citas al instante, muy útil.",
      "foto": ""
    },
    {
      "nombre": "Lucía y Toby 🐾",
      "comentario": "Ahora llevo el historial de mi mascota en un solo lugar.",
      "foto": ""
    },
  ];

  int _currentIndex = 0;

  void _siguienteTestimonio() {
    setState(() {
      _currentIndex = (_currentIndex + 1) % testimonios.length;
    });
  }

  @override
  Widget build(BuildContext context) {
    final testimonio = testimonios[_currentIndex];

    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            CircleAvatar(
              backgroundImage: NetworkImage(testimonio["foto"]!),
              radius: 30,
            ),
            const SizedBox(height: 10),
            Text(
              testimonio["nombre"]!,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 6),
            Text(
              testimonio["comentario"]!,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ElevatedButton(
              onPressed: _siguienteTestimonio,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade900,
                foregroundColor: Colors.white,
              ),
              child: const Text("Ver otro"),
            )
          ],
        ),
      ),
    );
  }
}

// ================== CARD 2: TIPS (QUIZ) ==================
class _CardTips extends StatefulWidget {
  const _CardTips();

  @override
  State<_CardTips> createState() => _CardTipsState();
}

class _CardTipsState extends State<_CardTips> {
  final Map<String, dynamic> pregunta = {
    "texto": "¿Cada cuánto debo vacunar a mi perro cachorro?",
    "opciones": [
      {"texto": "Cada 3 meses", "correcta": false},
      {"texto": "Cada 21 días", "correcta": true},
      {"texto": "Una vez al año", "correcta": false},
    ]
  };

  void _validarRespuesta(bool correcta) {
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(correcta ? "¡Correcto! 🎉" : "Ups... ❌"),
          content: Text(correcta
              ? "Los cachorros deben vacunarse cada 21 días hasta completar su esquema."
              : "Revisa el calendario de vacunación recomendado por tu veterinario."),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cerrar"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.lightbulb_outline,
                size: 48, color: Colors.orangeAccent),
            const SizedBox(height: 12),
            Text(
              pregunta["texto"],
              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 12),
            ...pregunta["opciones"].map<Widget>((op) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 4),
                child: ElevatedButton(
                  onPressed: () => _validarRespuesta(op["correcta"]),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.blue.shade700,
                    foregroundColor: Colors.white,
                  ),
                  child: Text(op["texto"]),
                ),
              );
            }).toList(),
          ],
        ),
      ),
    );
  }
}

// ================== CARD 3: CURIOSIDADES (FLIP CARD) ==================
class _CardCuriosidades extends StatefulWidget {
  const _CardCuriosidades();

  @override
  State<_CardCuriosidades> createState() => _CardCuriosidadesState();
}

class _CardCuriosidadesState extends State<_CardCuriosidades> {
  bool _mostrandoFrente = true;
  final List<String> curiosidades = [
    "Los perros tienen un olfato 40 veces más sensible que el humano 🐕.",
    "Los gatos pueden saltar hasta 6 veces su altura 🐱.",
    "Un hámster puede correr hasta 8 km en su rueda en una sola noche 🐹.",
  ];
  int _index = 0;

  void _cambiarCuriosidad() {
    setState(() {
      _mostrandoFrente = !_mostrandoFrente;
      if (!_mostrandoFrente) {
        _index = (_index + 1) % curiosidades.length;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _cambiarCuriosidad,
      child: Card(
        elevation: 4,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: AnimatedSwitcher(
          duration: const Duration(milliseconds: 500),
          transitionBuilder: (child, animation) {
            final rotate = Tween(begin: pi, end: 0.0).animate(animation);
            return AnimatedBuilder(
              animation: rotate,
              child: child,
              builder: (context, child) {
                final angle = rotate.value;
                return Transform(
                  transform: Matrix4.rotationY(angle),
                  alignment: Alignment.center,
                  child: child,
                );
              },
            );
          },
          child: _mostrandoFrente
              ? Column(
                  key: const ValueKey("frente"),
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: const [
                    Icon(Icons.pets, size: 60, color: Colors.teal),
                    SizedBox(height: 12),
                    Text(
                      "Toca para ver una curiosidad 🐾",
                      style:
                          TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    )
                  ],
                )
              : Center(
                  key: const ValueKey("dorso"),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Text(
                      curiosidades[_index],
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w500),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}


//veterinarios preview
class VeterinariosPreview extends StatefulWidget {
  const VeterinariosPreview({super.key});

  @override
  State<VeterinariosPreview> createState() => _VeterinariosPreviewState();
}

class _VeterinariosPreviewState extends State<VeterinariosPreview> {
  final String baseUrl =
      "https://animalbeats-backend-production.up.railway.app";
  List<dynamic> veterinarios = [];
  bool cargando = true;

  @override
  void initState() {
    super.initState();
    _cargarVeterinarios();
  }

  Future<void> _cargarVeterinarios() async {
    try {
      final response = await http.get(Uri.parse("$baseUrl/veterinarios"));
      if (response.statusCode == 200) {
        setState(() {
          veterinarios = json.decode(response.body);
          cargando = false;
        });
      }
    } catch (e) {
      setState(() => cargando = false);
    }
  }

  void _mostrarDetalle(dynamic vet) {
    final String? imagenUrl = vet["imagen_url"];

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: Text(vet["nombre_completo"] ?? "Sin nombre"),
          content: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                (imagenUrl != null && imagenUrl.isNotEmpty)
                    ? Image.network(imagenUrl, height: 150)
                    : const Icon(Icons.person, size: 100),
                const SizedBox(height: 10),
                Text("Especialidad: ${vet["estudios_especialidad"] ?? "N/A"}"),
                Text("Edad: ${vet["edad"] ?? "N/A"}"),
                Text("Altura: ${vet["altura"] ?? "N/A"} m"),
                Text("Experiencia: ${vet["anios_experiencia"] ?? "N/A"} años"),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Cerrar"),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    if (cargando) {
      return const Center(child: CircularProgressIndicator());
    }
    if (veterinarios.isEmpty) {
      return const Text(
        "No hay veterinarios registrados aún.",
        style: TextStyle(color: Colors.black54),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          "Nuestros Veterinarios",
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),

        LayoutBuilder(
          builder: (context, constraints) {
            int cross = 1;
            if (constraints.maxWidth >= 1100) {
              cross = 3;
            } else if (constraints.maxWidth >= 700) {
              cross = 2;
            }

            return GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: veterinarios.length,
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: cross,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
                childAspectRatio: 1.0,
              ),
              itemBuilder: (context, index) {
                final vet = veterinarios[index];
                final String? imagenUrl = vet["imagen_url"];

                return Card(
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: (imagenUrl != null && imagenUrl.isNotEmpty)
                              ? Image.network(imagenUrl,
                                  height: 100,
                                  width: double.infinity,
                                  fit: BoxFit.cover)
                              : const Icon(Icons.person,
                                  size: 80, color: Colors.grey),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          vet["nombre_completo"] ?? "Sin nombre",
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                              fontSize: 16, fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          "Especialidad: ${vet["estudios_especialidad"] ?? "N/A"}",
                          textAlign: TextAlign.center,
                          style: const TextStyle(color: Colors.black54),
                        ),
                        const Spacer(),
                        ElevatedButton.icon(
                          onPressed: () => _mostrarDetalle(vet),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Colors.red.shade900,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          icon: const Icon(Icons.remove_red_eye),
                          label: const Text("Ver más"),
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ],
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
