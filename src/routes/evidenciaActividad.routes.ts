import { Router } from 'express';
import {
    registrarEvidenciaActividad,
    obtenerEvidenciasActividades,
    obtenerEvidenciasPorActividad,
    actualizarEvidenciaActividad,
    eliminarEvidenciaActividad
} from '../controllers/evidenciaActividad.controller';

const router = Router();

router.post('/', registrarEvidenciaActividad);
router.get('/', obtenerEvidenciasActividades);
router.get('/actividad/:actividadId', obtenerEvidenciasPorActividad);
router.put('/:id', actualizarEvidenciaActividad);
router.delete('/:id', eliminarEvidenciaActividad);

export default router;