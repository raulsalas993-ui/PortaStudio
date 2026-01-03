const mongoose = require('mongoose');

const ComentarioSchema = new mongoose.Schema({
    proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto', required: true },
    usuario: { type: String, required: true },
    texto: { type: String, required: true },
    fecha: { type: Date, default: Date.now },
    // NUEVO CAMPO: Define si es 'interno' o 'cliente'
    tipo: { type: String, enum: ['interno', 'cliente'], default: 'cliente' } 
});

module.exports = mongoose.model('Comentario', ComentarioSchema);