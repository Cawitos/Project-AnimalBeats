const conexion = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  const { n_documento, correoelectronico, contrasena, id_documento, nombre } = req.body;

  if (!n_documento || !correoelectronico || !contrasena || !id_documento || !nombre) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(contrasena, salt);

    const id_rol = 2; 

    const sql = `INSERT INTO Usuarios (n_documento, correoelectronico, contrasena, id_documento, nombre, id_rol, estado)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    await conexion.execute(sql, [n_documento, correoelectronico, hash, id_documento, nombre, id_rol, 'activo']);

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
};

exports.getTiposDocumento = async (req, res) => {
  try {
    const [results] = await conexion.execute('SELECT id, tipo FROM Documento');
    res.status(200).json(results);
  } catch (err) {
    console.error("Error en getTiposDocumento:", err);
    res.status(500).json({ mensaje: 'Error al obtener tipos de documento' });
  }
};

exports.login = async (req, res) => {
  const { correoelectronico, contrasena } = req.body;

  try {
    const [resultados] = await conexion.execute(
      'SELECT * FROM Usuarios WHERE correoelectronico = ?', [correoelectronico]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = resultados[0];
    const esCorrecta = bcrypt.compareSync(contrasena, usuario.contrasena);

    if (!esCorrecta) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ mensaje: 'Error interno al iniciar sesión' });
  }
};
