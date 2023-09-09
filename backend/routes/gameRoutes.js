const express = require('express');
const moment = require('moment');
const Game = require('../models/Game');
const passport = require('../config/passport');

const router = express.Router();

// Obtener todos los juegos
router.get('/list', async (req, res) => {
    try {
        const games = await Game.find();
        res.send(games);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});

//Obtener juegos segun busqueda
router.get('/games', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const { month, year } = req.query;

    try {
        const numericMonth = parseInt(month, 10);
        const numericYear = parseInt(year, 10);

        console.log("Buscando juegos para el mes:", numericMonth, "y año:", numericYear);
        let games = [];
        if (!isNaN(numericMonth) && !isNaN(numericYear)) {
            const startDate = new Date(Date.UTC(numericYear, numericMonth - 1, 1));
            const endDate = new Date(Date.UTC(numericYear, numericMonth, 1));

            games = await Game.find({
                fecha: {
                    $gte: startDate,
                    $lt: endDate
                }
            });
        } else {
            games = await Game.find();
        }
        res.send(games);
    } catch (err) {
        console.error('Error al obtener los juegos:', err);
        res.status(500).send({ error: err.message });
    }
});


const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Los meses en JavaScript van de 0 a 11
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
};

router.get('/listinprogress', async (req, res) => {
    try {
        const games = await Game.find({ status: 'in-progress' });  // Filtrar por status 'in-progress'
        
        // Formatear las fechas de los juegos antes de enviar la respuesta
        const formattedGames = games.map(game => ({
            ...game._doc,  // Esto copia todos los campos del juego
            fecha: formatDate(game.fecha)
        }));

        res.send(formattedGames);
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
});



// Agregar un nuevo juego
router.post('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    console.log('Datos recibidos:', req.body);
    try {
        // Transformar la fecha al formato deseado
        const formattedDate = moment(req.body.fecha, "YYYY-MM-DD").format("DD-MM-YYYY");
        req.body.fecha = formattedDate;
        console.log('Datos recibidos formateado:', req.body);
        const game = new Game(req.body);
        await game.save();
        res.status(201).send(game);
    } catch (err) {
        console.error('Error al guardar el juego:', err);
        res.status(400).send({ error: err.message });
    }
});


// Actualizar un juego
router.put('/update/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    delete req.body._id;
    try {
        const game = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!game) {
            return res.status(404).send({ message: 'Game not found' });
        }
        res.send(game);
    } catch (err) {
        res.status(400).send({ error: err.message });
    }
});

router.put('/complete/:id', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const game = await Game.findById(req.params.id);

        if (!game) {
            return res.status(404).send({ success: false, message: 'Game not found' });
        }

        game.status = 'completed';

        await game.save();

        // Aquí se envía una respuesta con un campo 'success' y el juego actualizado.
        res.send({ success: true, game: game });

    } catch (err) {
        res.status(400).send({ success: false, error: err.message });
    }
});

module.exports = router;
