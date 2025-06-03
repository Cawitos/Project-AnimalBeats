const express = require('express');
const router = express.Router();

// Obtener todas las alertas
router.get('/gestion-reportes', async (req, res) => {
    const connection = req.app.locals.connection;
    try {
        const [alertas] = await connection.execute(`
            SELECT Alertas.id, Alertas.id_Mascota, Mascota.Nombre AS nombre_mascota,
                   Alertas.id_cliente, Alertas.Fecha, Alertas.descripcion
            FROM Alertas
            JOIN Mascota ON Alertas.id_Mascota = Mascota.id
        `);
        res.json(alertas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las alertas' });
    }
});

// Guardar nueva alerta
router.post('/alertas/guardar', async (req, res) => {
    const connection = req.app.locals.connection;
    const { cliente, mascota, fecha, descripcion } = req.body;

    try {
        await connection.execute(`
            INSERT INTO Alertas (id_cliente, id_Mascota, Fecha, descripcion)
            VALUES (?, ?, ?, ?)
        `, [cliente, mascota, fecha, descripcion]);
        res.status(201).json({ message: 'Alerta guardada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar la alerta' });
    }
});

// Modificar alerta
router.put('/alertas/modificar/:id', async (req, res) => {
    const connection = req.app.locals.connection;
    const { id } = req.params;
    const { cliente, mascota, fecha, descripcion } = req.body;

    try {
        await connection.execute(`
            UPDATE Alertas
            SET id_cliente = ?, id_Mascota = ?, Fecha = ?, descripcion = ?
            WHERE id = ?
        `, [cliente, mascota, fecha, descripcion, id]);
        res.json({ message: 'Alerta actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al modificar la alerta' });
    }
});

// Obtener datos de una alerta para edición
router.get('/alertas/:id', async (req, res) => {
    const connection = req.app.locals.connection;
    const { id } = req.params;

    try {
        const [alertaRows] = await connection.execute("SELECT * FROM Alertas WHERE id = ?", [id]);
        if (alertaRows.length === 0) {
            return res.status(404).json({ error: 'Alerta no encontrada' });
        }

        const alerta = alertaRows[0];

        const [clientes] = await connection.execute("SELECT n_documento FROM Usuarios WHERE id_rol = 2");
        const [mascotas] = await connection.execute("SELECT id, Nombre FROM Mascota");

        res.json({ alerta, clientes, mascotas });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos de la alerta' });
    }
});

// Eliminar alerta
router.delete('/alertas/eliminar/:id', async (req, res) => {
    const connection = req.app.locals.connection;
    const { id } = req.params;

    try {
        await connection.execute("DELETE FROM Alertas WHERE id = ?", [id]);
        res.json({ message: 'Alerta eliminada correctamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la alerta' });
    }
});

module.exports = router;
