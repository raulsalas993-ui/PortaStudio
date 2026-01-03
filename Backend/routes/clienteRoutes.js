const express = require('express');
const router = express.Router();
const Cliente = require('../models/Cliente'); // Asegúrate de tener tu modelo Cliente

// Obtener todos
router.get('/', async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ _id: -1 });
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Crear cliente
router.post('/', async (req, res) => {
    try {
        const nuevoCliente = new Cliente(req.body);
        const guardado = await nuevoCliente.save();
        res.status(201).json(guardado);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// === RUTA DE ELIMINAR CLIENTE ===
router.delete('/:id', async (req, res) => {
    try {
        await Cliente.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cliente eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;