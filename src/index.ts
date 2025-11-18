// src/index.ts
import express from 'express';
import 'dotenv/config';
import fs from 'fs';

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
import evidenciaActividadRoutes from './routes/evidenciaActividad.routes';
import calificacionRoutes from './routes/calificacion.routes';

// Cargar la especificación de Swagger
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================================
// ✅ CREAR CARPETA UPLOADS SI NO EXISTE
// ==========================================================
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Carpeta "uploads" creada automáticamente');
}

// ==========================================================
// MIDDLEWARES GLOBALES
// ==========================================================
app.use(express.json());

// ==========================================================
// CONFIGURACIÓN DE ARCHIVOS ESTÁTICOS
// ==========================================================
app.use('/uploads', express.static('uploads'));

// ==========================================================
// DOCUMENTACIÓN SWAGGER/OPENAPI
// ==========================================================
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
app.use('/api/evidencias-actividades', evidenciaActividadRoutes);

// 3. Evidencias (NUEVO - para gestionar archivos de uploads)
app.use('/api/evidencias', evidenciaRoutes);

// 4. Inducción y Nivelación (Transaccionales)
app.use('/api/clases', claseRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/calificaciones', calificacionRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API de CACEI-Admision está completa y funcionando. ACCESO ABIERTO.');
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express con TypeScript corriendo en el puerto ${PORT}`);
    console.log(`📘 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
    console.log(`📁 Carpeta uploads configurada en: ${uploadsDir}`);
    console.log(`🌐 Archivos estáticos servidos desde: /uploads`);
});