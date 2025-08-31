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
      home: const IndexPage(), // <- Ahora la primera pantalla será el index
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
                      child: const Text("Login", style: TextStyle(color: Colors.white)),
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
                  // Card 1
                  Card(
                    elevation: 4,
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const ListTile(
                      leading: Icon(Icons.info, size: 40, color: Colors.blue),
                      title: Text("Bienvenido a AnimalBeats"),
                      subtitle: Text("xd"),
                    ),
                  ),

                  // Card 2
                  Card(
                    elevation: 4,
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const ListTile(
                      leading: Icon(Icons.image, size: 40, color: Colors.green),
                      title: Text("Espacio para Imagenes?"),
                      subtitle: Text("Foto de perro"),
                    ),
                  ),

                  // Card 3
                  Card(
                    elevation: 4,
                    margin: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: const ListTile(
                      leading: Icon(Icons.star, size: 40, color: Colors.amber),
                      title: Text("camilomks"),
                      subtitle: Text(""),
                    ),
                  ),
                ],
              ),
            ),
          ),

          //FOOTER 
          Container(
            padding: const EdgeInsets.all(15),
            color: Colors.red.shade900,
            child: Column(
              children: const [
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
