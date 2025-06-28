const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const cors = require('cors')

app.use(cors())
app.use(express.json());
app.use('/api/auth', authRoutes);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
