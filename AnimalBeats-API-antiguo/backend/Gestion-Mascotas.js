const express = require('express');
const sql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const puerto = 1409

const app = express();


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

app.use(bodyParser.json());

// Rutas de la api
app.listen(puerto, () => {
  console.log('Servidor escuchando en el puerto: ', puerto);
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