import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('Carga la pantalla de inicio correctamente', (WidgetTester tester) async {
    // Construir la app
    await tester.pumpWidget(const AnimalBeatsApp());

    // Verificar que aparece el texto de bienvenida
    expect(find.text("AnimalBeats"), findsOneWidget);
    expect(find.text("Login"), findsOneWidget);
    expect(find.text("Registro"), findsOneWidget);
  });
}
