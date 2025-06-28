const conexion = require('../config/db');
const bcrypt = require('bcrypt');

exports.register = (req, res) => {
    const { n_documento, correoelectronico, contrasena, id_documento, nombre } = req.body;

    if (!n_documento || !correoelectronico || !contrasena || !id_documento || !nombre) {
        return res.status(400).json({ mensaje: 'Faltan campos' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(contrasena, salt);

    const sql = `INSERT INTO Usuarios (n_documento, correoelectronico, contrasena, id_documento, nombre, estado)
                 VALUES (?, ?, ?, ?, ?, ?)`;

    conexion.query(sql, [n_documento, correoelectronico, hash, id_documento, nombre, 'activo'], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al registrar usuario' });
        }
        res.status(201).json({ mensaje: 'Usuario registrado exitosamente' });
    });
};
exports.getTiposDocumento = (req, res) => {
    const sql = 'SELECT id, tipo FROM Documento';
    conexion.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error al obtener tipos de documento' });
        }
        res.status(200).json(results);
    });
};

exports.login = (req, res) => {
    const { correoelectronico, contrasena } = req.body;

    const sql = 'SELECT * FROM Usuarios WHERE correoelectronico = ?';
    conexion.query(sql, [correoelectronico], (err, resultados) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ mensaje: 'Error en el servidor' });
        }

        if (resultados.length === 0) {
            return res.status(404).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = resultados[0];
        const esCorrecta = bcrypt.compareSync(contrasena, usuario.contrasena);

        if (!esCorrecta) {
            return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
        }

        res.status(200).json({ mensaje: 'Inicio de sesión exitoso', usuario });
    });
};
