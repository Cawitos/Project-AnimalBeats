const conexion = require('../config/db');

exports.getAdminDashboard = async (req, res) => {
  try {
    const [adminRows] = await conexion.execute(
      "SELECT nombre, correoelectronico FROM usuarios WHERE id_rol = ?", [1]
    );

    if (adminRows.length === 0) {
      return res.status(404).json({ error: "No se encontró ningún admin" });
    }

    const [countRows] = await conexion.execute(
      "SELECT COUNT(*) AS total FROM usuarios WHERE id_rol IN (2, 3)"
    );
    const totalClientes = countRows[0].total;


    res.json({
      usuario: {
        nombre: adminRows[0].nombre,
        correo: adminRows[0].correoelectronico,
      },
      total_clientes: totalClientes,
    });
  } catch (error) {
    console.error("Error en getAdminDashboard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
