import { Router } from 'express';
import {
    registrarEvidencia,
    obtenerEvidencias,
    obtenerEvidenciaPorId,
    actualizarEvidencia,
    eliminarEvidencia
} from '../controllers/evidencia.controller';

const router = Router();

router.post('/', registrarEvidencia);
router.get('/', obtenerEvidencias);
router.get('/:id', obtenerEvidenciaPorId);
router.put('/:id', actualizarEvidencia);
router.delete('/:id', eliminarEvidencia);

export default router;
