const express = require('express');
const router = express.Router();
const Comentario = require('../models/Comentario');
const Proyecto = require('../models/Proyecto');
const Notificacion = require('../models/Notificacion');

// 1. OBTENER COMENTARIOS (Devuelve todos, el frontend filtrará)
router.get('/:proyectoId', async (req, res) => {
    try {
        const comentarios = await Comentario.find({ proyectoId: req.params.proyectoId }).sort({ fecha: 1 });
        res.json(comentarios);
    } catch (error) { res.status(500).json({ mensaje: error.message }); }
});

// 2. AGREGAR COMENTARIO
router.post('/', async (req, res) => {
    try {
        // A. Guardar comentario con su TIPO (interno/cliente)
        const nuevoComentario = new Comentario(req.body);
        const guardado = await nuevoComentario.save();

        // B. Notificaciones inteligentes
        // Solo avisamos si es un comentario de CLIENTE (para no llenarte de spam interno)
        // O si quieres avisar de comentarios internos, quita el 'if'
        if (req.body.tipo === 'cliente') {
            const proyecto = await Proyecto.findById(req.body.proyectoId);
            if (proyecto) {
                // Si el usuario NO es admin (es decir, es el cliente real), creamos la alerta
                // Asumimos que si dice "Cliente" o el nombre del cliente, es externo.
                await new Notificacion({
                    texto: `💬 ${req.body.usuario} comentó en "${proyecto.titulo}"`,
                    tipo: 'comentario',
                    proyectoId: proyecto._id,
                    paraAdmin: true
                }).save();
            }
        }

        res.status(201).json(guardado);
    } catch (error) { res.status(400).json({ mensaje: error.message }); }
});

module.exports = router;