import { Router } from 'express';
import {
    registrarAsistencia,
    obtenerAsistencias,
    obtenerAsistenciaPorId,
    obtenerAsistenciasPorClase,
    actualizarAsistencia,
    eliminarAsistencia
} from '../controllers/asistencia.controller';

const router = Router();

router.post('/', registrarAsistencia);
router.get('/', obtenerAsistencias);
router.get('/clase/:claseId', obtenerAsistenciasPorClase);
router.get('/:id', obtenerAsistenciaPorId);
router.put('/:id', actualizarAsistencia);
router.delete('/:id', eliminarAsistencia);

export default router;