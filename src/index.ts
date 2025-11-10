import express from 'express';
import 'dotenv/config';
import docenteRoutes from './routes/docente.routes';
import preparatoriaRoutes from './routes/preparatoria.routes';
import actividadRoutes from './routes/actividad.routes';
import claseRoutes from './routes/clase.routes';
import estudianteRoutes from './routes/estudiante.routes';
import asistenciaRoutes from './routes/asistencia.routes';
import evidenciaRoutes from './routes/evidencia.routes';
import calificacionRoutes from './routes/calificacion.routes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(express.json());

// ==========================================================
// Rutas de la API CACEI-ADMISION (Completas)
// ==========================================================

// 1. Catálogos
app.use('/api/docentes', docenteRoutes);
app.use('/api/preparatorias', preparatoriaRoutes);
app.use('/api/estudiantes', estudianteRoutes);

// 2. Promoción
app.use('/api/actividades', actividadRoutes);

// 3. Inducción y Nivelación
app.use('/api/clases', claseRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/calificaciones', calificacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de CACEI-Admision está completa y funcionando. ¡Listo para conectar el frontend React!');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con TypeScript corriendo en el puerto ${PORT}`);
});