const express = require('express');
const sql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const puerto = 1409

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conexion a la base de datos AnimalBeats
const conexion = sql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'AnimalBeats'
});


// Comprobar que la conexion si se ha establecido
conexion.connect(error => {
  if (error) throw error;
  console.log('Conexión a la base de datos exitosa');
});


// Headers de la api
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', '*');
  next();
});


// Rutas de la api
app.listen(puerto, () => {
  console.log('Servidor escuchando en el puerto: ', puerto);
});

/* ==========================
*  Rutas de Gestion de usuarios
* ========================== */

// alejandro aqui tu codigo














/* ==========================
*  Rutas de Gestion de mascotas, Especies y razas
* ========================== */


// Mostrar todas las mascotas registradas
app.get('/mascotas', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let mascotas = "SELECT * FROM Mascota";
    conexion.query(mascotas, (err, resultado) => {
      if (err) throw err;
      if (resultado.length > 0) {
        res.json(resultado);
      }
      else {
        res.json('No hay mascotas registradas');
      }
    })
  })
});

// Mostrar una mascota en especifico
app.get('/Mascotas/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    let mascota = "SELECT * FROM Mascota WHERE id = ?";
    conexion.query(mascota, [id], (err, resultado) => {
      if (err) throw err;
      if (resultado.length > 0) {
        res.json(resultado);
      }
      else {
        res.json('No hay mascota registradas');
      }
    })
  })
});

// Registrar una mascota
app.post('/Mascotas/Registro', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    const { nombre, id_especie, id_raza, estado, fecha_nacimiento } = req.body;
    let insercion = "INSERT INTO Mascota (nombre, id_especie, id_raza, estado, fecha_nacimiento) VALUES (?, ?, ?, ?, ?)";
    conexion.query(insercion, [nombre, id_especie, id_raza, estado], (err, resultado) => {
      if (err) throw err;
      res.status(201).json({ "Mascota ingresada correctamente ": resultado });
    })
  })
});

// Actualizar mascota
app.put('/Mascotas/Actualizar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    const { nombre, estado } = req.body;
    let modificacion = "UPDATE Mascota SET nombre = ?, estado = ? WHERE id = ?";
    conexion.query(modificacion, [nombre, estado, id], (err, resultado) => {
      if (err) {
        console.log('Error al modificar la mascota ', err)
        res.status(500).json({ "Error al actualizar la mascota": err });
      }
      else {
        if (resultado.affectedRows > 0) {
          res.json({ "Mascota actualizada correctamente ": resultado });
        }
        else {
          res.status(404).json({ "No hay mascota registradas": resultado });
        }
      }
    })
  })
});

// Eliminar mascota
app.delete('/Mascotas/Eliminar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    let eliminacion = "DELETE FROM Mascota WHERE id = ?";
    conexion.query(eliminacion, id, (err, resultado) => {
      if (err) {
        console.log('Error al eliminar la mascota ', err)
        res.status(500).json({ "Error al eliminar la mascota": err });
      }
      else {
        if (resultado.affectedRows > 0) {
          res.json({ "Mascota eliminada correctamente ": resultado })
        }
        else {
          res.status(404).json({ "No hay mascota registradas": resultado });
        }
      }
    })
  })
});


// Obtener todas las especies
app.get('/Especies/Listado', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let especies = "SELECT * FROM Especie";
    conexion.query(especies, (err, resultado) => {
      if (err) throw err;
      if (resultado.length > 0) {
        res.json(resultado);
      }
      else {
        res.json('No hay especies registradas');
      }
    })
  })
});


// Registrar Especie
app.post('/Especies/Registrar', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    const { especie, imagen } = req.body;
    let insercion = "INSERT INTO Especie (especie, imagen) VALUES (?, ?)";
    conexion.query(insercion, [especie, imagen], (err, resultado) => {
      if (err) throw err;
      res.status(201).json({ "Mascota ingresada correctamente ": resultado });
    })
  })
});

// Actualizar Especie
app.put('/Especies/Actualizar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    const { especie, imagen } = req.body;
    let id = req.params.id;
    let modificacion = "UPDATE Especie SET especie = ?, imagen = ? WHERE id = ?";
    conexion.query(modificacion, [especie, imagen, id], (err, resultado) => {
      if (err) {
        console.log('Error al Modificar la especie ', err)
        res.status(500).json({ "Error al actualizar la especie": err });
      }
      else {
        if (resultado.affectedRows > 0) {
          res.json({ "Especie actualizada correctamente ": resultado });
        }
        else {
          res.status(404).json({ "No hay especies registradas": resultado });
        }
      }
    })
  })
});

// Eliminar Especie
app.delete('/Especies/Eliminar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    let eliminacion = "DELETE FROM Especie WHERE id = ?";
    conexion.query(eliminacion, [id], (err, resultado) => {
      if (err) {
        console.log('Error al Eliminar la especie ', err)
        res.status(500).json({ "Error al eliminar la especie": err });
      }
      else {
        if (resultado.affectedRows > 0) {
          res.json({ "Especie eliminada correctamente ": resultado });
        }
        else {
          res.status(404).json({ "No hay especies registradas": resultado });
        }
      }
    })
  })
})

// Obtener las razas dentro de la especie
app.get('/Razas/Listado/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    let razas = "SELECT raza, imagen FROM raza WHERE id_especie = ?";
    conexion.query(razas, id, (err, resultado) => {
      if (err) throw err;
      if (resultado.length > 0) {
        res.json(resultado);
      }
      else {
        res.json('No hay razas registradas');
      }
    })
  })
});

// Obtener las razas dentro de la especie
app.get('/Razas/info/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    let consulta = "SELECT * FROM raza WHERE id = ?";
    conexion.query(consulta, id, (err, resultado) => {
      if (err) throw err;
      if (resultado.length > 0) {
        res.json(resultado)
      }
      else {
        res.json('No hay informacion registrada de la raza')
      }
    })
  })
});

// Agregar raza
app.post('/Razas/Registar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    const { raza, descripcion, imagen } = req.body;
    let insercion = "INSERT INTO raza (id_especie, raza, descripcion, imagen ) VALUES (?, ?, ?, ?)";
    conexion.query(insercion, [id, raza, descripcion, imagen], (err, resultado) => {
      if (err) throw err;
      res.status(201).json({ "Raza creada correctamente": resultado })
    })
  })
});

// Actualizar raza
app.put('/Razas/Actualizar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    const { raza, descripcion, imagen } = req.body;
    let modificacion = "UPDATE raza SET raza = ?, descripcion = ?, imagen = ? WHERE id = ?";
    conexion.query(modificacion, [raza, descripcion, imagen, id], (err, resultado) => {
      if (err) {
        console.log('Error al Modificar la raza ', err)
        res.status(500).json({ "Error al actualizar la raza": err });
      }
      else {
        if (resultado.affectedRows > 0) {
          res.json({ "Raza actualizada correctamente ": resultado });
        }
        else {
          res.status(404).json({ "No hay razas registradas": resultado });
        }
      }
    })
  })
});

// Eliminar raza
app.delete('/Razas/Eliminar/:id', (req, res) => {
  conexion.connect(function (err) {
    if (err) throw err;
    let id = req.params.id;
    let eliminacion = "DELETE FROM raza WHERE id = ?";
    conexion.query(eliminacion, [id], (err, resultado) => {
      if (err) {
        console.log('Error al Eliminar la raza ', err)
        res.status(500).json({ "Error al eliminar la raza": err });
      }
      else {
        if (resultado.affectedRows > 0) {
          res.json({ "Raza eliminada correctamente ": resultado });
        }
        else {
          res.status(404).json({ "No hay razas registradas": resultado });
        }
      }
    })
  })
});

/*========================
*  Rutas de Gestion de reportes
*=========================*/

// Obtener todas las alertas
app.get('/gestion-reportes', async (req, res) => {
  try {
    const [alertas] = await conexion.promise().execute(`
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
app.post('/alertas/guardar', async (req, res) => {
  const { cliente, mascota, fecha, descripcion } = req.body;

  try {
    await conexion.promise().execute(`
      INSERT INTO Alertas (id_cliente, id_Mascota, Fecha, descripcion)
      VALUES (?, ?, ?, ?)
    `, [cliente, mascota, fecha, descripcion]);
    res.status(201).json({ message: 'Alerta guardada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la alerta' });
  }
});

// Modificar alerta
app.put('/alertas/modificar/:id', async (req, res) => {
  const { id } = req.params;
  const { cliente, mascota, fecha, descripcion } = req.body;

  try {
    await conexion.promise().execute(`
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
app.get('/alertas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [alertaRows] = await conexion.promise().execute("SELECT * FROM Alertas WHERE id = ?", [id]);
    if (alertaRows.length === 0) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }

    const alerta = alertaRows[0];

    const [clientes] = await conexion.promise().execute("SELECT n_documento FROM Usuarios WHERE id_rol = 2");
    const [mascotas] = await conexion.promise().execute("SELECT id, Nombre FROM Mascota");

    res.json({ alerta, clientes, mascotas });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener datos de la alerta' });
  }
});

// Eliminar alerta
app.delete('/alertas/eliminar/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await conexion.promise().execute("DELETE FROM Alertas WHERE id = ?", [id]);
    res.json({ message: 'Alerta eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la alerta' });
  }
});