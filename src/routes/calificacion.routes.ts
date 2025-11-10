import { Router } from 'express';
import {
    registrarCalificacion,
    obtenerCalificaciones,
    obtenerCalificacionPorId,
    actualizarCalificacion,
    eliminarCalificacion
} from '../controllers/calificacion.controller';

const router = Router();

router.post('/', registrarCalificacion);
router.get('/', obtenerCalificaciones);
router.get('/:id', obtenerCalificacionPorId);
router.put('/:id', actualizarCalificacion);
router.delete('/:id', eliminarCalificacion);

export default router;