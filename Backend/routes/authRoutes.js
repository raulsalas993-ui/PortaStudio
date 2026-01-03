const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const JWT_SECRET = 'secreto_super_seguro_compass_studio'; 

router.post('/registro', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        const existe = await Usuario.findOne({ email });
        if (existe) return res.status(400).json({ mensaje: 'El email ya existe' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const nuevoUsuario = new Usuario({ nombre, email, password: passwordHash });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Usuario creado' });
    } catch (error) { res.status(500).json({ mensaje: error.message }); }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const usuario = await Usuario.findOne({ email });
        if (!usuario) return res.status(400).json({ mensaje: 'Usuario no encontrado' });
        const esCorrecta = await bcrypt.compare(password, usuario.password);
        if (!esCorrecta) return res.status(400).json({ mensaje: 'Password incorrecto' });

        const token = jwt.sign({ id: usuario._id, rol: usuario.rol }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, usuario: { id: usuario._id, nombre: usuario.nombre, rol: usuario.rol } });
    } catch (error) { res.status(500).json({ mensaje: error.message }); }
});

module.exports = router;