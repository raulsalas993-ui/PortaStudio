const express = require('express');
const router = express.Router();
const Notificacion = require('../models/Notificacion');

router.get('/', async (req, res) => {
    try {
        const notificaciones = await Notificacion.find().sort({ fecha: -1 }).limit(20);
        res.json(notificaciones);
    } catch (error) { res.json([]); } // Retorna vacío si falla
});

router.put('/:id/leer', async (req, res) => {
    try {
        await Notificacion.findByIdAndUpdate(req.params.id, { leido: true });
        res.json({ success: true });
    } catch (error) { res.json({ error: true }); }
});

module.exports = router;