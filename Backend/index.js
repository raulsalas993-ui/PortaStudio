const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors({
    origin: "*", // Permite que tu frontend de Vercel se conecte
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Permitir ver imágenes subidas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Conexión DB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/agencia_db')
    .then(() => console.log('✅ MongoDB Conectado'))
    .catch(err => console.error('Error Mongo:', err));

// === TODAS LAS RUTAS NECESARIAS ===
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/proyectos', require('./routes/proyectoRoutes'));
app.use('/api/clientes', require('./routes/clienteRoutes'));
app.use('/api/comentarios', require('./routes/comentarioRoutes'));
// Estas dos son vitales para tu versión actual:
app.use('/api/recursos', require('./routes/recursoRoutes')); 
app.use('/api/notificaciones', require('./routes/notificacionRoutes'));

// RUTA DASHBOARD
app.get('/api/dashboard/actividad', async (req, res) => {
    try {
        const Proyecto = require('./models/Proyecto');
        const Comentario = require('./models/Comentario');
        const total = await Proyecto.countDocuments();
        const aprobados = await Proyecto.countDocuments({ decision: 'Aprobado' });
        const pendientes = await Proyecto.countDocuments({ decision: 'Pendiente' });
        const ultimosComentarios = await Comentario.find().sort({ fecha: -1 }).limit(5).populate('proyectoId', 'titulo');
        const proyectosRecientes = await Proyecto.find().sort({ createdAt: -1 }).limit(5).select('titulo cliente decision estado');
        
        res.json({ stats: { total, aprobados, pendientes }, comentarios: ultimosComentarios, proyectos: proyectosRecientes });
    } catch (error) { console.error(error); res.json({ stats: {}, comentarios: [], proyectos: [] }); } // Evita crash si falla
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server ready on port ${PORT}`));

module.exports = app; // <--- ESTO ES LO QUE NECESITA VERCEL