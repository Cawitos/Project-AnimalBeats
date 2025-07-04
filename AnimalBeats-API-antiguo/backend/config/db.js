const mysql = require('mysql2/promise');

const conexion = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'AnimalBeats',
});


conexion.getConnection()
  .then(conn => {
    console.log('Conexión a la base de datos exitosa');
    conn.release();
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos:', err);
  });

module.exports = conexion;

