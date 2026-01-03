const express = require('express');
const router = express.Router();
const multer = require('multer');
const Proyecto = require('../models/Proyecto');
const Notificacion = require('../models/Notificacion');

require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuración Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: { folder: 'agencia-app', resource_type: 'auto' }
});
const upload = multer({ storage });

// 1. LEER TODOS
router.get('/', async (req, res) => {
    try { const p = await Proyecto.find().sort({ _id: -1 }); res.json(p); } 
    catch (e) { res.status(500).json({ message: e.message }); }
});

// 2. LEER UNO
router.get('/:id', async (req, res) => {
    try { const p = await Proyecto.findById(req.params.id); res.json(p); } 
    catch (e) { res.status(500).json({ message: e.message }); }
});

// 3. CREAR PROYECTO
router.post('/', upload.single('imagen'), async (req, res) => {
    try {
        const body = req.body;
        if(req.file) body.logo = req.file.path;
        const nuevo = await new Proyecto(body).save();
        res.json(nuevo);
    } catch (e) { res.status(400).json({ message: e.message }); }
});

// 4. SUBIR ARCHIVO (Modo Clásico - Lista Plana)
router.post('/:id/version', upload.single('archivo'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ mensaje: 'Falta archivo' });
        
        const nuevaVersion = {
            url: req.file.path,
            nombre: req.file.originalname,
            tipo: req.file.mimetype,
            fecha: new Date()
        };

        // Usamos $push en 'versiones' que es lo que tu frontend lee
        const p = await Proyecto.findByIdAndUpdate(
            req.params.id, 
            { $push: { versiones: nuevaVersion } }, 
            { new: true }
        );
        
        // Notificación
        await new Notificacion({ 
            texto: `📂 Nuevo archivo subido: "${req.file.originalname}"`, 
            tipo: 'comentario', 
            proyectoId: p._id 
        }).save();
        
        res.json(p);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 5. DECISIÓN INTELIGENTE (TOGGLE / CICLO)
router.put('/:id/decision', async (req, res) => {
    try {
        const { decision } = req.body; // Lo que el usuario clickeó (ej: "Aprobado")
        
        // Buscamos el estado ACTUAL
        const proyectoActual = await Proyecto.findById(req.params.id);
        if (!proyectoActual) return res.status(404).json({ mensaje: 'No encontrado' });

        // Lógica del Interruptor:
        let nuevoEstado = decision;
        
        // Si ya estaba en ese estado, lo apagamos (volvemos a Pendiente)
        if (proyectoActual.decision === decision) {
            nuevoEstado = 'Pendiente';
        }
        // Si estaba en otro estado, simplemente cambia al nuevo (ej: de Rechazado a Aprobado)

        // Guardamos el cambio
        const proyecto = await Proyecto.findByIdAndUpdate(
            req.params.id, 
            { decision: nuevoEstado }, 
            { new: true }
        );
        
        // Notificación según el resultado real
        let textoNotif = '';
        let icono = '🔄';

        if (nuevoEstado === 'Pendiente') {
            textoNotif = `La decisión fue cancelada. El proyecto vuelve a estar Pendiente.`;
            icono = '↩️';
        } else if (nuevoEstado === 'Aprobado') {
            textoNotif = `¡El cliente APROBÓ el proyecto! 🎉`;
            icono = '✅';
        } else if (nuevoEstado === 'Rechazado') {
            textoNotif = `El cliente solicitó CAMBIOS (Rechazado).`;
            icono = '❌';
        }

        await new Notificacion({ 
            texto: `${icono} ${textoNotif}`, 
            tipo: 'decision', 
            proyectoId: proyecto._id 
        }).save();

        res.json(proyecto);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 6. REACCIONES
router.put('/:id/reaccion', async (req, res) => {
    try {
        const tipo = req.body.tipo;
        const p = await Proyecto.findByIdAndUpdate(req.params.id, { $inc: { [`reacciones.${tipo}`]: 1 } }, { new: true });
        
        let emoji = tipo === 'like' ? '👍' : tipo === 'love' ? '❤️' : '👎';
        await new Notificacion({ 
            texto: `${emoji} Nueva reacción recibida`, 
            tipo: 'reaccion', 
            proyectoId: p._id 
        }).save();

        res.json(p);
    } catch (error) { res.status(500).json({ message: error.message }); }
});

// 7. SELECCIONAR VERSIÓN FINAL
router.put('/:id/seleccionar', async (req, res) => {
    try {
        const p = await Proyecto.findByIdAndUpdate(req.params.id, { decision: 'Aprobado', archivoFinal: req.body.urlArchivo }, { new: true });
        await new Notificacion({ texto: `🎉 Versión final seleccionada`, tipo: 'decision', proyectoId: p._id }).save();
        res.json(p);
    } catch(e) { res.status(500).json(e); }
});

// 8. ELIMINAR
router.delete('/:id', async (req, res) => { await Proyecto.findByIdAndDelete(req.params.id); res.json({ok:true}); });

module.exports = router;