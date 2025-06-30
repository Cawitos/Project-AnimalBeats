const express = require('express');
const app = express();
const cors = require('cors')
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const usuariosRoutes = require('./routes/Usuarios'); 



app.use(cors())
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/usuario', usuariosRoutes);



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
