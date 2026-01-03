const mongoose = require('mongoose');

const NotificacionSchema = new mongoose.Schema({
    texto: { type: String, required: true },
    tipo: { type: String, enum: ['reaccion', 'decision', 'comentario'], required: true },
    proyectoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Proyecto' },
    fecha: { type: Date, default: Date.now },
    leido: { type: Boolean, default: false }, // <--- Esto controlará el color
    paraAdmin: { type: Boolean, default: true } // Para diferenciar quién la ve
});

module.exports = mongoose.model('Notificacion', NotificacionSchema);