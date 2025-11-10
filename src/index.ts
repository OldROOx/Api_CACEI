import express from 'express';
import 'dotenv/config';
import cors from 'cors';

// Módulos de Documentación
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

// Importación de todas las rutas de la API
import docenteRoutes from './routes/docente.routes';
import preparatoriaRoutes from './routes/preparatoria.routes';
import actividadRoutes from './routes/actividad.routes';
import claseRoutes from './routes/clase.routes';
import estudianteRoutes from './routes/estudiante.routes';
import asistenciaRoutes from './routes/asistencia.routes';
import evidenciaRoutes from './routes/evidencia.routes';
import calificacionRoutes from './routes/calificacion.routes';

// Cargar la especificación de Swagger (ASUME que tienes un archivo ./swagger.yaml o ./swagger.json)
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================================
// MIDDLEWARES GLOBALES
// ==========================================================
app.use(express.json());
app.use(cors({
    // Configura el origen para permitir la comunicación con el frontend de React (puerto común de Vite)
    origin: 'http://localhost:5173'
}));

// ==========================================================
// DOCUMENTACIÓN SWAGGER/OPENAPI
// ==========================================================
// Servirá la interfaz de Swagger UI en http://localhost:3000/api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// ==========================================================
// RUTAS DE LA API CACEI-ADMISION (COMPLETAS)
// ==========================================================

// 1. Catálogos
app.use('/api/docentes', docenteRoutes);
app.use('/api/preparatorias', preparatoriaRoutes);
app.use('/api/estudiantes', estudianteRoutes);

// 2. Promoción
app.use('/api/actividades', actividadRoutes);

// 3. Inducción y Nivelación (Transaccionales)
app.use('/api/clases', claseRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/calificaciones', calificacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de CACEI-Admision está completa y funcionando. Visita /api-docs para la documentación.');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con TypeScript corriendo en el puerto ${PORT}`);
    console.log(`📘 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});