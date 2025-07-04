const express = require('express');
const sql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const puerto = 3000

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
// Listar usuarios
app.get('/Listado', async (req, res) => {
  const sqlQuery = `
    SELECT u.n_documento, u.nombre, u.correoelectronico, d.tipo AS tipo_documento, u.estado
    FROM Usuarios u
    LEFT JOIN Documento d ON u.id_documento = d.id
  `;
  try {
    const [resultado] = await conexion.query(sqlQuery);
    res.json(resultado.length > 0 ? resultado : 'No hay usuarios registrados');
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// Obtener usuario por documento
app.get('/:n_documento', async (req, res) => {
  const { n_documento } = req.params;
  const sqlQuery = `
    SELECT u.n_documento, u.nombre, u.correoelectronico, d.tipo AS tipo_documento
    FROM Usuarios u
    LEFT JOIN Documento d ON u.id_documento = d.id
    WHERE u.n_documento = ?
  `;
  try {
    const [resultado] = await conexion.query(sqlQuery, [n_documento]);
    res.json(resultado.length > 0 ? resultado[0] : 'Usuario no encontrado');
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear usuario
app.post('/Crear', async (req, res) => {
  const { n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const sqlInsert = `
      INSERT INTO Usuarios (n_documento, nombre, correoelectronico, contrasena, id_documento, id_rol, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [resultado] = await conexion.query(sqlInsert, [n_documento, nombre, correoelectronico, hashedPassword, id_documento, id_rol, estado]);
    res.status(201).json({ mensaje: 'Usuario registrado correctamente', resultado });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
});

// Actualizar usuario
app.put('/Actualizar/:n_documento', async (req, res) => {
  const { n_documento } = req.params;
  const { nombre, correoelectronico, id_documento, id_rol, estado } = req.body;
  const sqlUpdate = `
    UPDATE Usuarios
    SET nombre = ?, correoelectronico = ?, id_documento = ?, id_rol = ?, estado = ?
    WHERE n_documento = ?
  `;
  try {
    const [resultado] = await conexion.query(sqlUpdate, [nombre, correoelectronico, id_documento, id_rol, estado, n_documento]);
    res.json(resultado.affectedRows > 0 ? { mensaje: 'Usuario actualizado correctamente' } : 'Usuario no encontrado');
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Suspender usuario
app.put('/Suspender/:n_documento', async (req, res) => {
  const { n_documento } = req.params;
  const sqlUpdate = `UPDATE Usuarios SET estado = 'Suspendido' WHERE n_documento = ?`;
  try {
    const [resultado] = await conexion.query(sqlUpdate, [n_documento]);
    res.json(resultado.affectedRows > 0 ? { mensaje: 'Usuario suspendido correctamente' } : 'Usuario no encontrado');
  } catch (err) {
    console.error('Error al suspender usuario:', err);
    res.status(500).json({ error: 'Error al suspender usuario' });
  }
});

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



/* ==========================
*  Rutas de Gestion de enfermedades y citas
* ========================== */

// Obtener todas las enfermedades
app.get('/Enfermedades/Listado', (req, res) => {
  conexion.connect((err) => {
    if (err) throw err;
    const query = "SELECT * FROM Enfermedad";
    conexion.query(query, (err, resultado) => {
      if (err) throw err;
      if (resultado.length > 0) {
        res.json(resultado);
      } else {
        res.json({ mensaje: 'No hay enfermedades registradas' });
      }
    });
  });
});

// Registrar nueva enfermedad
app.post('/Enfermedades/Registrar', (req, res) => {
  conexion.connect((err) => {
    if (err) throw err;
    const { nombre, descripcion } = req.body;
    const query = "INSERT INTO Enfermedad (nombre, descripcion) VALUES (?, ?)";
    conexion.query(query, [nombre, descripcion], (err, resultado) => {
      if (err) {
        console.log('Error al registrar la enfermedad:', err);
        res.status(500).json({ error: 'Error al registrar la enfermedad' });
      } else {
        res.status(201).json({ mensaje: 'Enfermedad registrada correctamente', resultado });
      }
    });
  });
});

// Actualizar enfermedad
app.put('/Enfermedades/Actualizar/:nombre', (req, res) => {
  conexion.connect((err) => {
    if (err) throw err;
    const { descripcion } = req.body;
    const nombre = req.params.nombre;
    const query = "UPDATE Enfermedad SET descripcion = ? WHERE nombre = ?";
    conexion.query(query, [descripcion, nombre], (err, resultado) => {
      if (err) {
        console.log('Error al modificar la enfermedad:', err);
        res.status(500).json({ error: 'Error al actualizar la enfermedad' });
      } else {
        if (resultado.affectedRows > 0) {
          res.json({ mensaje: 'Enfermedad actualizada correctamente', resultado });
        } else {
          res.status(404).json({ mensaje: 'No se encontró la enfermedad' });
        }
      }
    });
  });
});

// Eliminar enfermedad
app.delete('/Enfermedades/Eliminar/:nombre', (req, res) => {
  conexion.connect((err) => {
    if (err) throw err;
    const nombre = req.params.nombre;
    const query = "DELETE FROM Enfermedad WHERE nombre = ?";
    conexion.query(query, [nombre], (err, resultado) => {
      if (err) {
        console.log('Error al eliminar la enfermedad:', err);
        res.status(500).json({ error: 'Error al eliminar la enfermedad' });
      } else {
        if (resultado.affectedRows > 0) {
          res.json({ mensaje: 'Enfermedad eliminada correctamente', resultado });
        } else {
          res.status(404).json({ mensaje: 'No se encontró la enfermedad' });
        }
      }
    });
  });
});

//Rutas de citas
// Obtener todas las citas
app.get('/Citas/Listado', (req, res) => {
  conexion.query('SELECT * FROM Citas', (err, resultado) => {
    if (err) {
      console.error('Error al obtener citas:', err);
      return res.status(500).json({ error: 'Error al obtener las citas' });
    }
    if (resultado.length > 0) {
      res.json(resultado);
    } else {
      res.json({ mensaje: 'No hay citas registradas' });
    }
  });
});

// Registrar nueva cita
app.post('/Citas/Registrar', (req, res) => {
  const { id_Mascota, id_cliente, id_Servicio, fecha, Descripcion } = req.body;
  const query = `
    INSERT INTO Citas (id_Mascota, id_cliente, id_Servicio, fecha, Descripcion)
    VALUES (?, ?, ?, ?, ?)
  `;
  conexion.query(query, [id_Mascota, id_cliente, id_Servicio, fecha, Descripcion], (err, resultado) => {
    if (err) {
      console.error('Error al registrar cita:', err);
      return res.status(500).json({ error: 'Error al registrar la cita' });
    }
    res.status(201).json({ mensaje: 'Cita registrada correctamente', resultado });
  });
});

// Obtener una cita por ID
app.get('/Citas/:id', (req, res) => {
  const { id } = req.params;
  conexion.query('SELECT * FROM Citas WHERE id = ?', [id], (err, resultado) => {
    if (err) {
      console.error('Error al buscar la cita:', err);
      return res.status(500).json({ error: 'Error al buscar la cita' });
    }
    if (resultado.length > 0) {
      res.json(resultado[0]);
    } else {
      res.status(404).json({ mensaje: 'Cita no encontrada' });
    }
  });
});

// Actualizar una cita por ID
app.put('/Citas/Actualizar/:id', (req, res) => {
  const { id } = req.params;
  const { id_Mascota, id_cliente, id_Servicio, fecha, Descripcion } = req.body;
  const query = `
    UPDATE Citas
    SET id_Mascota = ?, id_cliente = ?, id_Servicio = ?, fecha = ?, Descripcion = ?
    WHERE id = ?
  `;
  conexion.query(query, [id_Mascota, id_cliente, id_Servicio, fecha, Descripcion, id], (err, resultado) => {
    if (err) {
      console.error('Error al actualizar cita:', err);
      return res.status(500).json({ error: 'Error al actualizar la cita' });
    }
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Cita actualizada correctamente', resultado });
    } else {
      res.status(404).json({ mensaje: 'Cita no encontrada para actualizar' });
    }
  });
});

// Eliminar una cita por ID
app.delete('/Citas/Eliminar/:id', (req, res) => {
  const { id } = req.params;
  conexion.query('DELETE FROM Citas WHERE id = ?', [id], (err, resultado) => {
    if (err) {
      console.error('Error al eliminar cita:', err);
      return res.status(500).json({ error: 'Error al eliminar la cita' });
    }
    if (resultado.affectedRows > 0) {
      res.json({ mensaje: 'Cita eliminada correctamente', resultado });
    } else {
      res.status(404).json({ mensaje: 'Cita no encontrada para eliminar' });
    }
  });
});


/*========================
*  Rutas de Gestion de recordatorios
*=========================*/

// Obtener todas las alarmas de recordatorios
app.get('/gestionRecordatorios', async (req, res) => {
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

// Modificar recordatorio
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