const express = require('express');
const router = express.Router();
const multer = require('multer');
const Recurso = require('../models/Recurso');

// Configuración Cloudinary
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'agencia-recursos',
        resource_type: 'auto'
    }
});
const upload = multer({ storage });

// Obtener recursos
router.get('/', async (req, res) => {
    try {
        const recursos = await Recurso.find().sort({ _id: -1 });
        res.json(recursos);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Subir recurso
router.post('/', upload.single('archivo'), async (req, res) => {
    try {
        const { nombre, categoria } = req.body;
        const nuevoRecurso = new Recurso({
            nombre,
            categoria,
            url: req.file.path,
            tipo: req.file.mimetype
        });
        const guardado = await nuevoRecurso.save();
        res.status(201).json(guardado);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// Borrar recurso
router.delete('/:id', async (req, res) => {
    try { await Recurso.findByIdAndDelete(req.params.id); res.json({ message: 'Eliminado' }); }
    catch (error) { res.status(500).json({ message: error.message }); }
});

module.exports = router;