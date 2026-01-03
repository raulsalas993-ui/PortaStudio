const mongoose = require('mongoose');
const ClienteSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    email: { type: String, required: true },
    empresa: String,
    telefono: String,
    fechaRegistro: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Cliente', ClienteSchema);