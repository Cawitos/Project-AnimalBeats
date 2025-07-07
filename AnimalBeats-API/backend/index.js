const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const puerto = 3000;
const JWT_SECRET = 'Alejo192006'; 

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexión asincrónica a la base de datos AnimalBeats
let conexion;
(async () => {
  try {
    conexion = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Alejo19',
      database: 'AnimalBeats',
    });
    console.log('Conexión a la base de datos exitosa');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
    process.exit(1);
  }
})();

// Headers de la API
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});

// Rutas de la API
app.listen(puerto, () => {
  console.log('Servidor escuchando en el puerto:', puerto);
});

/* ==========================
*  Rutas de gestión de usuarios
* ========================== */

// Registro de usuario
app.post('/registro', async (req, res) => {
  const { n_documento, correoelectronico, contrasena, id_documento, nombre } = req.body;

  if (!n_documento || !correoelectronico || !contrasena || !id_documento || !nombre) {
    return res.status(400).json({ mensaje: 'Faltan campos' });
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(contrasena, salt);

    let id_rol, rolTexto;
    if (correoelectronico.toLowerCase() === 'administrador@animalbeats.com') {
      id_rol = 1; rolTexto = 'admin';
    } else if (correoelectronico.toLowerCase() === 'veterinario@animalbeats.com') {
      id_rol = 3; rolTexto = 'veterinario';
    } else {
      id_rol = 2; rolTexto = 'cliente';
    }

    const sql = `
      INSERT INTO Usuarios (n_documento, correoelectronico, contrasena, id_documento, nombre, id_rol, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await conexion.execute(sql, [n_documento, correoelectronico, hash, id_documento, nombre, id_rol, 'activo']);

    res.status(201).json({ mensaje: 'Usuario registrado exitosamente', rol: rolTexto });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ mensaje: 'Error al registrar usuario' });
  }
});

// Obtener tipos de documento
app.get('/tiposDocumento', async (req, res) => {
  try {
    const [results] = await conexion.query('SELECT id, tipo FROM Documento');
    res.status(200).json(results);
  } catch (err) {
    console.error("Error en getTiposDocumento:", err);
    res.status(500).json({ mensaje: 'Error al obtener tipos de documento' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { correoelectronico, contrasena } = req.body;

  try {
    const [resultados] = await conexion.execute(
      'SELECT * FROM Usuarios WHERE correoelectronico = ?',
      [correoelectronico]
    );

    if (resultados.length === 0) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const usuario = resultados[0];
    const esCorrecta = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esCorrecta) return res.status(401).json({ mensaje: 'Contraseña incorrecta' });

    let rolTexto;
    switch (usuario.id_rol) {
      case 1: rolTexto = 'admin'; break;
      case 2: rolTexto = 'cliente'; break;
      case 3: rolTexto = 'veterinario'; break;
      default: rolTexto = 'desconocido';
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      rol: usuario.id_rol
    };

    // Generar el token, válido por 1 hora
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

    // Enviar solo esta respuesta
    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.id_rol },
      rol: rolTexto,
      token
    });

  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ mensaje: 'Error interno al iniciar sesión' });
  }
});

// Listar usuarios
app.get('/usuario/Listado', async (req, res) => {
  const sqlQuery = `
    SELECT u.n_documento, u.nombre, u.correoelectronico, d.tipo AS tipo_documento, u.estado
    FROM Usuarios u
    LEFT JOIN Documento d ON u.id_documento = d.id
    WHERE u.estado != 'Suspendido'
  `;
  try {
    const [resultado] = await conexion.query(sqlQuery);
    res.json({ usuarios: resultado });
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener usuario por documento
app.get('/usuario/:n_documento', async (req, res) => {
  const { n_documento } = req.params;
  const sqlQuery = `
    SELECT u.n_documento, u.nombre, u.correoelectronico, d.tipo AS tipo_documento
    FROM Usuarios u
    LEFT JOIN Documento d ON u.id_documento = d.id
    WHERE u.n_documento = ?
  `;
  try {
    const [resultado] = await conexion.execute(sqlQuery, [n_documento]);
    res.json(resultado.length > 0 ? resultado[0] : 'Usuario no encontrado');
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear usuario
app.post('/usuario/Crear', async (req, res) => {
  const { n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const sqlInsert = `
      INSERT INTO Usuarios (n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const estado = 'activo'; // estado fijo

    const [resultado] = await conexion.execute(sqlInsert, [
      n_documento, nombre, correoelectronico, hashedPassword, id_documento, id_rol, estado,
    ]);

    res.status(201).json({ mensaje: 'Usuario registrado correctamente', resultado });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Actualizar usuario
app.put('/usuario/Actualizar/:n_documento', async (req, res) => {
  const { nombre, correoelectronico, id_documento, id_rol, n_documento_original } = req.body;


  const estado = 'activo';

  const sqlUpdate = `
    UPDATE Usuarios
    SET nombre = ?, correoelectronico = ?, id_documento = ?, id_rol = ?, estado = ?
    WHERE n_documento = ?
  `;

  try {
    const [resultado] = await conexion.execute(sqlUpdate, [
      nombre, correoelectronico, id_documento, id_rol, estado, n_documento_original,
    ]);


    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Usuario actualizado correctamente' });
    } else {
      res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});


// Suspender usuario
app.put('/usuario/Suspender/:n_documento', async (req, res) => {
  const { n_documento } = req.params;

  const sqlUpdate = `UPDATE Usuarios SET estado = 'Suspendido' WHERE n_documento = ?`;

  try {
    const [resultado] = await conexion.execute(sqlUpdate, [n_documento]);

    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Usuario suspendido correctamente' });
    } else {
      res.json('Usuario no encontrado');
    }
  } catch (err) {
    console.error('Error al suspender usuario:', err);
    res.status(500).json({ error: 'Error al suspender usuario' });
  }
});

//Ruta Tabla de Roles
app.get('/roles/Listado', async (req, res) => {
  const sqlQuery = `
    SELECT id, rol
    FROM Rol
  `;
  try {
    const [resultado] = await conexion.query(sqlQuery);
    res.json({ roles: resultado });
  } catch (err) {
    console.error('Error al obtener roles:', err);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
});

//Ruta Crear Roles
app.post('/roles/Crear', async (req, res) => {
  const { rol } = req.body;
  if (!rol || rol.trim() === '') {
    return res.status(400).json({ error: 'El rol es obligatorio' });
  }
  try {
    const sqlInsert = 'INSERT INTO Rol (rol) VALUES (?)';
    const [resultado] = await conexion.query(sqlInsert, [rol.trim()]);
    res.json({ message: 'Rol creado correctamente', id: resultado.insertId });
  } catch (err) {
    console.error('Error al crear rol:', err);
    res.status(500).json({ error: 'Error al crear rol' });
  }
});

// Dashboard de admin
app.get('/admin/dashboard', async (req, res) => {
  try {
    // Obtener el primer administrador registrado 
    const [adminRows] = await conexion.execute(
      "SELECT nombre, correoelectronico FROM usuarios WHERE id_rol = ?", [1]
    );

    if (adminRows.length === 0) {
      return res.status(404).json({ error: "No se encontró ningún admin" });
    }

    // Contar total de usuarios que sean clientes o veterinarios 
    const [countRows] = await conexion.execute(
      "SELECT COUNT(*) AS total FROM usuarios WHERE id_rol IN (2, 3)"
    );

    const totalClientes = countRows[0].total;

    // Enviar respuesta con datos del admin y el conteo de clientes
    res.json({
      usuario: {
        nombre: adminRows[0].nombre,
        correo: adminRows[0].correoelectronico,
      },
      total_clientes: totalClientes,
    });
  } catch (error) {
    console.error("Error en /admin/dashboard:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Mostrar todas las mascotas registradas
app.get('/mascotas', async (req, res) => {
  try {
    const [mascotas] = await conexion.query("SELECT * FROM Mascota");
    if (mascotas.length > 0) {
      res.json(mascotas);
    } else {
      res.json('No hay mascotas registradas');
    }
  } catch (err) {
    console.error('Error al obtener mascotas:', err);
    res.status(500).json({ error: 'Error al obtener mascotas' });
  }
});

// Mostrar una mascota en específico
app.get('/Mascotas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await conexion.execute("SELECT * FROM Mascota WHERE id = ?", [id]);
    if (resultado.length > 0) {
      res.json(resultado[0]);
    } else {
      res.status(404).json('No hay mascota registrada con ese ID');
    }
  } catch (err) {
    console.error('Error al obtener mascota:', err);
    res.status(500).json({ error: 'Error al obtener mascota' });
  }
});

// Registrar una mascota
app.post('/Mascotas/Registro', async (req, res) => {
  const { nombre, id_especie, id_raza, estado, fecha_nacimiento } = req.body;
  try {
    const sql = "INSERT INTO Mascota (nombre, id_especie, id_raza, estado, fecha_nacimiento) VALUES (?, ?, ?, ?, ?)";
    const [resultado] = await conexion.execute(sql, [nombre, id_especie, id_raza, estado, fecha_nacimiento]);
    res.status(201).json({ mensaje: "Mascota ingresada correctamente", resultado });
  } catch (err) {
    console.error('Error al registrar mascota:', err);
    res.status(500).json({ error: 'Error al registrar mascota' });
  }
});

// Actualizar mascota
app.put('/Mascotas/Actualizar/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, estado } = req.body;
  try {
    const sql = "UPDATE Mascota SET nombre = ?, estado = ? WHERE id = ?";
    const [resultado] = await conexion.execute(sql, [nombre, estado, id]);
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Mascota actualizada correctamente", resultado });
    } else {
      res.status(404).json({ mensaje: "No hay mascota registrada con ese ID" });
    }
  } catch (err) {
    console.error('Error al actualizar mascota:', err);
    res.status(500).json({ error: 'Error al actualizar mascota' });
  }
});

// Eliminar mascota
app.delete('/Mascotas/Eliminar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await conexion.execute("DELETE FROM Mascota WHERE id = ?", [id]);
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Mascota eliminada correctamente", resultado });
    } else {
      res.status(404).json({ mensaje: "No hay mascota registrada con ese ID" });
    }
  } catch (err) {
    console.error('Error al eliminar mascota:', err);
    res.status(500).json({ error: 'Error al eliminar mascota' });
  }
});

// Obtener todas las especies
app.get('/Especies/Listado', async (req, res) => {
  try {
    const [especies] = await conexion.query("SELECT * FROM Especie");
    if (especies.length > 0) {
      res.json(especies);
    } else {
      res.json('No hay especies registradas');
    }
  } catch (err) {
    console.error('Error al obtener especies:', err);
    res.status(500).json({ error: 'Error al obtener especies' });
  }
});

// Registrar especie
app.post('/Especies/Registrar', async (req, res) => {
  const { especie, imagen } = req.body;
  try {
    const sql = "INSERT INTO Especie (especie, imagen) VALUES (?, ?)";
    const [resultado] = await conexion.execute(sql, [especie, imagen]);
    res.status(201).json({ mensaje: "Especie ingresada correctamente", resultado });
  } catch (err) {
    console.error('Error al registrar especie:', err);
    res.status(500).json({ error: 'Error al registrar especie' });
  }
});

// Actualizar especie
app.put('/Especies/Actualizar/:id', async (req, res) => {
  const { id } = req.params;
  const { especie, imagen } = req.body;
  try {
    const sql = "UPDATE Especie SET especie = ?, imagen = ? WHERE id = ?";
    const [resultado] = await conexion.execute(sql, [especie, imagen, id]);
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Especie actualizada correctamente", resultado });
    } else {
      res.status(404).json({ mensaje: "No hay especie registrada con ese ID" });
    }
  } catch (err) {
    console.error('Error al actualizar especie:', err);
    res.status(500).json({ error: 'Error al actualizar especie' });
  }
});

// Eliminar especie
app.delete('/Especies/Eliminar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [resultado] = await conexion.execute("DELETE FROM Especie WHERE id = ?", [id]);
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: "Especie eliminada correctamente", resultado });
    } else {
      res.status(404).json({ mensaje: "No hay especie registrada con ese ID" });
    }
  } catch (err) {
    console.error('Error al eliminar especie:', err);
    res.status(500).json({ error: 'Error al eliminar especie' });
  }
});



// Obtener las razas dentro de la especie
app.get('/Razas/Listado/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const id = req.params.id;
  try {
    const [resultado] = await connection.execute(
      "SELECT raza, imagen FROM raza WHERE id_especie = ?", [id]
    );
    if (resultado.length > 0) {
      res.json(resultado);
    } else {
      res.json({ mensaje: 'No hay razas registradas' });
    }
  } catch (error) {
    console.error('Error al obtener las razas:', error);
    res.status(500).json({ error: 'Error al obtener las razas' });
  }
});

// Obtener info de una raza por ID
app.get('/Razas/info/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const id = req.params.id;
  try {
    const [resultado] = await connection.execute(
      "SELECT * FROM raza WHERE id = ?", [id]
    );
    if (resultado.length > 0) {
      res.json(resultado[0]);
    } else {
      res.status(404).json({ mensaje: 'No hay información registrada de la raza' });
    }
  } catch (error) {
    console.error('Error al obtener información de la raza:', error);
    res.status(500).json({ error: 'Error al obtener información de la raza' });
  }
});

// Agregar raza
app.post('/Razas/Registrar/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const id = req.params.id;
  const { raza, descripcion, imagen } = req.body;
  try {
    const [resultado] = await connection.execute(
      "INSERT INTO raza (id_especie, raza, descripcion, imagen) VALUES (?, ?, ?, ?)",
      [id, raza, descripcion, imagen]
    );
    res.status(201).json({ mensaje: 'Raza creada correctamente', resultado });
  } catch (error) {
    console.error('Error al registrar la raza:', error);
    res.status(500).json({ error: 'Error al registrar la raza' });
  }
});

// Actualizar raza
app.put('/Razas/Actualizar/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const id = req.params.id;
  const { raza, descripcion, imagen } = req.body;
  try {
    const [resultado] = await connection.execute(
      "UPDATE raza SET raza = ?, descripcion = ?, imagen = ? WHERE id = ?",
      [raza, descripcion, imagen, id]
    );
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Raza actualizada correctamente', resultado });
    } else {
      res.status(404).json({ mensaje: 'No se encontró la raza para actualizar' });
    }
  } catch (error) {
    console.error('Error al actualizar la raza:', error);
    res.status(500).json({ error: 'Error al actualizar la raza' });
  }
});

// Eliminar raza
app.delete('/Razas/Eliminar/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const id = req.params.id;
  try {
    const [resultado] = await connection.execute(
      "DELETE FROM raza WHERE id = ?", [id]
    );
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Raza eliminada correctamente', resultado });
    } else {
      res.status(404).json({ mensaje: 'No se encontró la raza para eliminar' });
    }
  } catch (error) {
    console.error('Error al eliminar la raza:', error);
    res.status(500).json({ error: 'Error al eliminar la raza' });
  }
});


// =======================
// Rutas de Enfermedades
// =======================

// Obtener todas las enfermedades
app.get('/Enfermedades/Listado', async (req, res) => {
  try {
    const [resultado] = await conexion.execute("SELECT * FROM Enfermedad");
    if (resultado.length > 0) {
      return res.json(resultado);
    }
    return res.json({ mensaje: 'No hay enfermedades registradas' });
  } catch (error) {
    console.error('Error al obtener enfermedades:', error);
    return res.status(500).json({ error: 'Error al obtener enfermedades' });
  }
});


// Registrar nueva enfermedad
app.post('/Enfermedades/Registrar', async (req, res) => {
  const { nombre, descripcion } = req.body;
  try {
    const [resultado] = await conexion.execute(
      "INSERT INTO Enfermedad (nombre, descripcion) VALUES (?, ?)",
      [nombre, descripcion]
    );
    res.status(201).json({ mensaje: 'Enfermedad registrada correctamente', resultado });
  } catch (error) {
    console.error('Error al registrar la enfermedad:', error);
    res.status(500).json({ error: 'Error al registrar la enfermedad' });
  }
});

// Actualizar enfermedad
app.put('/Enfermedades/Actualizar/:nombre', async (req, res) => {
  const nombre = req.params.nombre;
  const { descripcion } = req.body;
  try {
    const [resultado] = await conexion.execute(
      "UPDATE Enfermedad SET descripcion = ? WHERE nombre = ?",
      [descripcion, nombre]
    );
    if (resultado.affectedRows > 0) {
      return res.json({ mensaje: 'Enfermedad actualizada correctamente', resultado });
    } else {
      return res.status(404).json({ mensaje: 'No se encontró la enfermedad' });
    }
  } catch (error) {
    console.error('Error al actualizar la enfermedad:', error);
    return res.status(500).json({ error: 'Error al actualizar la enfermedad' });
  }
});

// Eliminar enfermedad
app.delete('/Enfermedades/Eliminar/:nombre', async (req, res) => {
  const nombre = req.params.nombre;
  try {
    const [resultado] = await conexion.execute(
      "DELETE FROM Enfermedad WHERE nombre = ?",
      [nombre]
    );
    if (resultado.affectedRows > 0) {
      return res.json({ mensaje: 'Enfermedad eliminada correctamente', resultado });
    } else {
      return res.status(404).json({ mensaje: 'No se encontró la enfermedad' });
    }
  } catch (error) {
    console.error('Error al eliminar la enfermedad:', error);
    return res.status(500).json({ error: 'Error al eliminar la enfermedad' });
  }
});

// =======================
// Rutas de Citas
// =======================

// Obtener todas las citas
app.get('/Citas/Listado', async (req, res) => {
  try {
    const [resultado] = await conexion.execute('SELECT * FROM Citas');
    if (resultado.length > 0) {
      res.json(resultado);
    } else {
      res.json({ mensaje: 'No hay citas registradas' });
    }
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

// Registrar nueva cita
app.post('/Citas/Registrar', async (req, res) => {
  const { id_Mascota, id_cliente, id_Servicio, fecha, Descripcion } = req.body;
  try {
    const [resultado] = await conexion.execute(
      `INSERT INTO Citas (id_Mascota, id_cliente, id_Servicio, fecha, Descripcion)
       VALUES (?, ?, ?, ?, ?)`,
      [id_Mascota, id_cliente, id_Servicio, fecha, Descripcion]
    );
    res.status(201).json({ mensaje: 'Cita registrada correctamente', resultado });
  } catch (error) {
    console.error('Error al registrar la cita:', error);
    res.status(500).json({ error: 'Error al registrar la cita' });
  }
});

// Obtener una cita por ID
app.get('/Citas/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [resultado] = await conexion.execute(
      'SELECT * FROM Citas WHERE id = ?', [id]
    );
    if (resultado.length > 0) {
      res.json(resultado[0]);
    } else {
      res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
  } catch (error) {
    console.error('Error al buscar la cita:', error);
    res.status(500).json({ error: 'Error al buscar la cita' });
  }
});

// Actualizar una cita por ID
app.put('/Citas/Actualizar/:id', async (req, res) => {
  const id = req.params.id;
  const { id_Mascota, id_cliente, id_Servicio, fecha, Descripcion } = req.body;
  try {
    const [resultado] = await conexion.execute(
      `UPDATE Citas SET id_Mascota = ?, id_cliente = ?, id_Servicio = ?, fecha = ?, Descripcion = ?
       WHERE id = ?`,
      [id_Mascota, id_cliente, id_Servicio, fecha, Descripcion, id]
    );
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Cita actualizada correctamente', resultado });
    } else {
      res.status(404).json({ mensaje: 'Cita no encontrada para actualizar' });
    }
  } catch (error) {
    console.error('Error al actualizar cita:', error);
    res.status(500).json({ error: 'Error al actualizar la cita' });
  }
});

// Eliminar una cita por ID
app.delete('/Citas/Eliminar/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [resultado] = await conexion.execute(
      'DELETE FROM Citas WHERE id = ?', [id]
    );
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Cita eliminada correctamente', resultado });
    } else {
      res.status(404).json({ mensaje: 'Cita no encontrada para eliminar' });
    }
  } catch (error) {
    console.error('Error al eliminar cita:', error);
    res.status(500).json({ error: 'Error al eliminar la cita' });
  }
});

/* ========================
*  Rutas de Servicios
* ======================== */
app.get('/servicios/Listado', async (req, res) => {
  try {
    const [resultado] = await conexion.execute('SELECT * FROM servicios');
    if (resultado.length > 0) {
      res.json(resultado);
    } else {
      res.json({ mensaje: 'No hay citas registradas' });
    }
  } catch (error) {
    console.error('Error al obtener citas:', error);
    res.status(500).json({ error: 'Error al obtener citas' });
  }
});

/* ========================
*  Rutas de Gestión de Recordatorios
* ======================== */

// Obtener todas las alarmas de recordatorios
app.get('/gestionRecordatorios', async (req, res) => {
  const connection = req.app.locals.connection;
  try {
    const [alertas] = await connection.execute(`
      SELECT Recordatorios.id, Recordatorios.id_Mascota, Mascota.Nombre AS nombre_mascota,
             Recordatorios.id_cliente, Recordatorios.Fecha, Recordatorios.descripcion
      FROM Recordatorios
      JOIN Mascota ON Recordatorios.id_Mascota = Mascota.id
    `);
    res.json(alertas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las alertas' });
  }
});

// Guardar nuevo recordatorio
app.post('/recordatorios/guardar', async (req, res) => {
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

// Modificar recordatorio existente
app.put('/recordatorios/modificar/:id', async (req, res) => {
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
app.get('/recordatorios/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const { id } = req.params;

  try {
    const [alertaRows] = await connection.execute(
      "SELECT * FROM Recordatorios WHERE id = ?", [id]
    );

    if (alertaRows.length === 0) {
      return res.status(404).json({ error: 'Recordatorio no encontrado' });
    }

    const alerta = alertaRows[0];
    const [clientes] = await connection.execute(
      "SELECT n_documento FROM Usuarios WHERE id_rol = 2"
    );
    const [mascotas] = await connection.execute(
      "SELECT id, Nombre FROM Mascota"
    );

    res.json({ alerta, clientes, mascotas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos del recordatorio' });
  }
});

// Eliminar recordatorio
app.delete('/recordatorios/eliminar/:id', async (req, res) => {
  const connection = req.app.locals.connection;
  const { id } = req.params;

  try {
    await connection.execute("DELETE FROM Recordatorios WHERE id = ?", [id]);
    res.json({ message: 'Recordatorio eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el recordatorio' });
  }
});
