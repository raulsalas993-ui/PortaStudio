const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Usuario = require('../models/Usuario');

// 1. OBTENER TODO EL EQUIPO
router.get('/', async (req, res) => {
    try {
        // Devolvemos todos menos la contraseña
        const usuarios = await Usuario.find().select('-password');
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// 2. CREAR UN NUEVO EMPLEADO (Solo Admin)
router.post('/', async (req, res) => {
    try {
        const { nombre, email, password, rol, puesto } = req.body;

        // Verificar si existe
        const existe = await Usuario.findOne({ email });
        if (existe) return res.status(400).json({ mensaje: 'El email ya existe' });

        // Encriptar password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const nuevoUsuario = new Usuario({
            nombre,
            email,
            password: passwordHash,
            rol,
            puesto // Guardamos el puesto
        });

        await nuevoUsuario.save();
        res.status(201).json({ mensaje: 'Empleado registrado con éxito' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

// 3. ELIMINAR EMPLEADO
router.delete('/:id', async (req, res) => {
    try {
        await Usuario.findByIdAndDelete(req.params.id);
        res.json({ mensaje: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ mensaje: error.message });
    }
});

module.exports = router;