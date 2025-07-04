
const conexion = require('../config/db'); 
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();


// RUTAS

router.get('/Listado', async (req, res) => {
    const sql = `
      SELECT u.n_documento, u.nombre, u.correoelectronico, d.tipo AS tipo_documento,u.estado
      FROM Usuarios u
      LEFT JOIN Documento d ON u.id_documento = d.id
    `;
    try {
        const [resultado] = await conexion.query(sql);
        res.json(resultado.length > 0 ? resultado : 'No hay usuarios registrados');
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios' });
    }
});

router.get('/:n_documento', async (req, res) => {
    const { n_documento } = req.params;
    const sql = `
      SELECT u.n_documento, u.nombre, u.correoelectronico, d.tipo AS tipo_documento
      FROM Usuarios u
      LEFT JOIN Documento d ON u.id_documento = d.id
      WHERE u.n_documento = ?
    `;
    try {
        const [resultado] = await conexion.query(sql, [n_documento]);
        res.json(resultado.length > 0 ? resultado[0] : 'Usuario no encontrado');
    } catch (err) {
        console.error('Error al obtener usuario:', err);
        res.status(500).json({ error: 'Error al obtener usuario' });
    }
});

router.post('/Crear', async (req, res) => {
    const { n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        const sql = "INSERT INTO Usuarios (n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const [resultado] = await conexion.query(sql, [n_documento, nombre, correoelectronico, hashedPassword, id_documento, id_rol, estado]);
        res.status(201).json({ mensaje: 'Usuario registrado correctamente', resultado });
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ error: 'Error al registrar usuario' });
    }
});

router.put('/Actualizar/:n_documento', async (req, res) => {
    const { n_documento } = req.params;
    const { nombre, correoelectronico, id_documento, id_rol, estado } = req.body;
    const sql = "UPDATE Usuarios SET nombre = ?, correoelectronico = ?, id_documento = ?, id_rol = ?, estado = ? WHERE n_documento = ?";
    try {
        const [resultado] = await conexion.query(sql, [nombre, correoelectronico, id_documento, id_rol, estado, n_documento]);
        res.json(resultado.affectedRows > 0 ? { mensaje: 'Usuario actualizado correctamente' } : 'Usuario no encontrado');
    } catch (err) {
        console.error('Error al actualizar usuario:', err);
        res.status(500).json({ error: 'Error al actualizar usuario' });
    }
});

router.put('/Suspender/:n_documento', async (req, res) => {
    const { n_documento } = req.params;
    const sql = "UPDATE Usuarios SET estado = 'Suspendido' WHERE n_documento = ?";
    try {
        const [resultado] = await conexion.query(sql, [n_documento]);
        res.json(resultado.affectedRows > 0 ? { mensaje: 'Usuario suspendido correctamente' } : 'Usuario no encontrado');
    } catch (err) {
        console.error('Error al suspender usuario:', err);
        res.status(500).json({ error: 'Error al suspender usuario' });
    }
});

module.exports = router;