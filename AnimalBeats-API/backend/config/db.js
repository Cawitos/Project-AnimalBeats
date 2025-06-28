const mysql = require('mysql2');

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Alejo19', 
    database: 'AnimalBeats'
});

conexion.connect((err) => {
    if (err) {
        console.error('Error al conectar la base de datos:', err);
    } else {
        console.log('Conexión a la base de datos exitosa');
    }
});

module.exports = conexion;