import { Router } from 'express';
import {
    registrarAsistenciaMasiva,
    obtenerResumenAsistencia,
    obtenerAsistenciaPorClase,
    obtenerAsistenciaPorId, // CRUD Individual
    actualizarAsistencia,   // CRUD Individual
    eliminarAsistencia      // CRUD Individual
} from '../controllers/asistencia.controller';

const router = Router();

// Rutas de Creación y Lectura de Colecciones
router.post('/', registrarAsistenciaMasiva); // Uso principal: Toma de asistencia masiva (Upsert)
router.get('/resumen', obtenerResumenAsistencia);

// Rutas de Lógica de Negocio
router.get('/clase/:claseId', obtenerAsistenciaPorClase); // Obtener todos los registros DE UNA CLASE

// Rutas CRUD individuales (operaciones por AsistenciaID - PK)
// La ruta dinámica ':id' es manejada por obtener/actualizar/eliminar
router.get('/:id', obtenerAsistenciaPorId);
router.put('/:id', actualizarAsistencia);
router.delete('/:id', eliminarAsistencia);

export default router;