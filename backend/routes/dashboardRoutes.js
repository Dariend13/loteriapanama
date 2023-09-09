const express = require('express');
const passport = require('passport'); // Importa Passport para proteger las rutas del dashboard
const router = express.Router();

// Middleware de autenticación con Passport
const authenticateUser = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    // Aquí podrías registrar el cierre de sesión, si es necesario

    // Luego, informar al frontend que el proceso fue exitoso
    res.json({ message: 'Logged out successfully' });
});

// Ruta de inicio del dashboard (protegida por autenticación)
router.get('/', authenticateUser, (req, res) => {
    // Esta es la vista del dashboard, puedes renderizar un archivo HTML aquí
    // Por ejemplo: res.render('dashboard');
    res.send('¡Bienvenido al dashboard!');
});

// Otras rutas del dashboard pueden ir aquí

module.exports = router;
