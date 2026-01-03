const mongoose = require('mongoose');

const ProyectoSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    cliente: { type: String, required: true },
    descripcion: { type: String },
    estado: { type: String, default: 'Borrador' },
    fechaEntrega: Date,
    logo: { type: String },
    
    // === ESTO ES LO QUE TU FRONTEND BUSCA (LISTA PLANA) ===
    versiones: [{
        url: String,
        nombre: String,
        tipo: String,
        fecha: { type: Date, default: Date.now }
    }],
    
    // Mantenemos 'archivos' solo por seguridad si hay datos mixtos, 
    // pero el frontend usará 'versiones'
    archivos: [mongoose.Schema.Types.Mixed], 
    
    archivoFinal: { type: String, default: '' },
    
    reacciones: {
        like: { type: Number, default: 0 },
        love: { type: Number, default: 0 },
        fire: { type: Number, default: 0 }
    },
    decision: { type: String, enum: ['Pendiente', 'Aprobado', 'Rechazado'], default: 'Pendiente' }
});

module.exports = mongoose.model('Proyecto', ProyectoSchema);