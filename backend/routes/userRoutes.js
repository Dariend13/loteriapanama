const express = require('express');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');
const dotenv = require('dotenv');

dotenv.config();

const router = express.Router();

// Registro
// Registro
router.post('/register', async (req, res) => {
    try {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        await user.save();
        
        // Después de registrar con éxito, redirigir al usuario al dashboard
        res.redirect('/dashboard'); // Cambia '/dashboard' a la URL real de tu dashboard
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});



// Inicio de sesión
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.send({ message: 'Logged in successfully', token, success: true }); // Añade un indicador de éxito
});


module.exports = router;
