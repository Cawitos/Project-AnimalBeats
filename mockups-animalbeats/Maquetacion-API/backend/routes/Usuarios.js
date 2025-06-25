// routes/usuarios.js

const express = require('express');
const sql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const router = express.Router();

// Conexión a la base de datos
const conexion = sql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Alejo19',
    database: 'AnimalBeats'
});

conexion.connect(error => {
    if (error) throw error;
    console.log('Conexión a la base de datos exitosa');
});

// Middleware
router.use(bodyParser.json());

// RUTAS

router.get('/Listado', (req, res) => {
    const sql = "SELECT * FROM Usuarios";
    conexion.query(sql, (err, resultado) => {
        if (err) throw err;
        res.json(resultado.length > 0 ? resultado : 'No hay usuarios registrados');
    });
});

router.get('/:n_documento', (req, res) => {
    const { n_documento } = req.params;
    const sql = "SELECT * FROM Usuarios WHERE n_documento = ?";
    conexion.query(sql, [n_documento], (err, resultado) => {
        if (err) throw err;
        res.json(resultado.length > 0 ? resultado[0] : 'Usuario no encontrado');
    });
});

router.post('/Registro', async (req, res) => {
    const { n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado } = req.body;
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const sql = "INSERT INTO Usuarios (n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)";
    conexion.query(sql, [n_documento, nombre, correoelectronico, hashedPassword, id_documento, id_rol, estado], (err, resultado) => {
        if (err) {
            console.error('Error al registrar usuario:', err);
            res.status(500).json({ error: 'Error al registrar usuario' });
        } else {
            res.status(201).json({ mensaje: 'Usuario registrado correctamente', resultado });
        }
    });
});

router.put('/Actualizar/:n_documento', (req, res) => {
    const { n_documento } = req.params;
    const { nombre, correoelectronico, id_documento, id_rol, estado } = req.body;
    const sql = "UPDATE Usuarios SET nombre = ?, correoelectronico = ?, id_documento = ?, id_rol = ?, estado = ? WHERE n_documento = ?";
    conexion.query(sql, [nombre, correoelectronico, id_documento, id_rol, estado, n_documento], (err, resultado) => {
        if (err) {
            console.error('Error al actualizar usuario:', err);
            res.status(500).json({ error: 'Error al actualizar usuario' });
        } else {
            res.json(resultado.affectedRows > 0 ? { mensaje: 'Usuario actualizado correctamente' } : 'Usuario no encontrado');
        }
    });
});

router.put('/Suspender/:n_documento', (req, res) => {
    const { n_documento } = req.params;
    const sql = "UPDATE Usuarios SET estado = 'Suspendido' WHERE n_documento = ?";
    conexion.query(sql, [n_documento], (err, resultado) => {
        if (err) {
            console.error('Error al suspender usuario:', err);
            res.status(500).json({ error: 'Error al suspender usuario' });
        } else {
            res.json(resultado.affectedRows > 0 ? { mensaje: 'Usuario suspendido correctamente' } : 'Usuario no encontrado');
        }
    });
});

module.exports = router;
