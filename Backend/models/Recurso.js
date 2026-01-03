const mongoose = require('mongoose');

const RecursoSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    url: { type: String, required: true }, // Link de Cloudinary
    categoria: { 
        type: String, 
        enum: ['Branding', 'Legal', 'Plantillas', 'Otros'], 
        default: 'Otros' 
    },
    tipo: { type: String }, // 'pdf', 'image', 'docx', etc.
    fecha: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Recurso', RecursoSchema);