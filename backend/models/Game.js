const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    tipoSorteo: {
        type: String,
        required: true,
        enum: ['Miercolitos', 'Gordito', 'Dominical']
    },
    fecha: {
        type: Date,
        required: true
    },    
    primerPremio: {
        type: mongoose.Schema.Types.Mixed,
    },
    letras: {
        type: String,
    },
    serie: {
        type: mongoose.Schema.Types.Mixed,
    },
    folio: {
        type: mongoose.Schema.Types.Mixed,
    },
    segundoPremio: {
        type: mongoose.Schema.Types.Mixed,
    },
    tercerPremio: {
        type: mongoose.Schema.Types.Mixed,
    },
    status: {
        type: String,
        enum: ['in-progress', 'completed'],
        default: 'in-progress'
    }
});

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;
