const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const passport = require('./config/passport'); // Asegúrate de importar Passport

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const userRoutes = require('./routes/userRoutes');
const gameRoutes = require('./routes/gameRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes'); // Agrega el enrutador del dashboard

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('Error al conectar a MongoDB:', err));

app.use(cors({
    origin: 'http://localhost:3001',  // reemplaza con la URL de tu frontend
    credentials: true  // permite el envío de cookies
  }));
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
app.use(express.json());
app.use('/api/users', userRoutes);
app.use('/api/games', gameRoutes);

// Usa Passport para la autenticación
app.use(passport.initialize());

// Agrega el enrutador del dashboard
app.use('/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
    res.send('Servidor funcionando');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
