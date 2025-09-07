import 'package:shared_preferences/shared_preferences.dart';

class StorageService {
  // Guardar documento y rol
  static Future<void> saveUser(String nDocumento, int idRol) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('nDocumento', nDocumento);
    await prefs.setInt('idRol', idRol);
  }

  // Obtener documento
  static Future<String?> getDocumento() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('nDocumento');
  }

  // Obtener rol
  static Future<int?> getRol() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getInt('idRol');
  }

  // Limpiar datos (logout)
  static Future<void> clearUser() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('nDocumento');
    await prefs.remove('idRol');
  }
}
