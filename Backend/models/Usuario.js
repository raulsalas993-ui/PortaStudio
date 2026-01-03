const mongoose = require('mongoose');

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    rol: { type: String, default: 'admin' },
    fechaRegistro: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Usuario', UsuarioSchema);