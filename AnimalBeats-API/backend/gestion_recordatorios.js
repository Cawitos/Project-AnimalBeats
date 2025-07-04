const express = require('express');
const router = express.Router();

// Obtener todas las alarmas de recordatorios
router.get('/gestionRecordatorios', async (req, res) => {
    const connection = req.app.locals.connection;
    try {
        const [alertas] = await connection.execute(`
            SELECT Recordatorios.id, Recordatorios.id_Mascota, Mascota.Nombre AS nombre_mascota,
                   Recordatorios.id_cliente, Recordatorios.Fecha, Recordatorios.descripcion
            FROM Alertas
            JOIN Mascota ON Recordatorios.id_Mascota = Mascota.id
        `);
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las alertas' });
    }
});

// Guardar el nuevo recordatorio
router.post('/recordatorios/guardar', async (req, res) => {
    const connection = req.app.locals.connection;
    const { cliente, mascota, fecha, descripcion } = req.body;

    try {
        await connection.execute(`
            INSERT INTO Recordatorios (id_cliente, id_Mascota, Fecha, descripcion)
            VALUES (?, ?, ?, ?)
        `, [cliente, mascota, fecha, descripcion]);
        res.status(201).json({ message: 'Recordatorio guardado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar el recordatorio' });
    }
});

// Modificar recordatorio
router.put('/recordatorios/modificar/:id', async (req, res) => {
    const connection = req.app.locals.connection;
    const { id } = req.params;
    const { cliente, mascota, fecha, descripcion } = req.body;

    try {
        await connection.execute(`
            UPDATE Recordatorios
            SET id_cliente = ?, id_Mascota = ?, Fecha = ?, descripcion = ?
            WHERE id = ?
        `, [cliente, mascota, fecha, descripcion, id]);
        res.json({ message: 'Recordatorio actualizado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al modificar el recordatorio' });
    }
});

// Obtener datos de un recordatorio para edición
router.get('/recordatorios/:id', async (req, res) => {
    const connection = req.app.locals.connection;
    const { id } = req.params;

    try {
        const [alertaRows] = await connection.execute("SELECT * FROM Recordatorios WHERE id = ?", [id]);
        if (alertaRows.length === 0) {
            return res.status(404).json({ error: 'Recordatorio no encontrada' });
        }

        const alerta = alertaRows[0];

        const [clientes] = await connection.execute("SELECT n_documento FROM Usuarios WHERE id_rol = 2");
        const [mascotas] = await connection.execute("SELECT id, Nombre FROM Mascota");

        res.json({ alerta, clientes, mascotas });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos del recordatorio' });
    }
});

// Eliminar recordatorio
router.delete('/recordatorios/eliminar/:id', async (req, res) => {
    const connection = req.app.locals.connection;
    const { id } = req.params;

    try {
        await connection.execute("DELETE FROM Recordatorios WHERE id = ?", [id]);
        res.json({ message: 'Recordatorio eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar el recordatorio' });
    }
});

module.exports = router;
