import { Router } from 'express';
import {
    registrarEstudiante,
    cargarEstudiantesMasivo,
    obtenerEstudiantes,
    obtenerEstudiantePorId,
    obtenerEstadisticasEstudiantes,
    actualizarEstudiante,
    eliminarEstudiante
} from '../controllers/estudiante.controller';
import { uploadExcelMiddleware } from '../middleware/uploadExcel';

const router = Router();

// Rutas de Lectura y Creación
router.post('/', registrarEstudiante);
router.post('/carga-masiva', uploadExcelMiddleware, cargarEstudiantesMasivo);
router.get('/', obtenerEstudiantes);
router.get('/estadisticas', obtenerEstadisticasEstudiantes);

// Rutas Específicas
router.get('/:id', obtenerEstudiantePorId);
router.put('/:id', actualizarEstudiante);
router.delete('/:id', eliminarEstudiante);

export default router;