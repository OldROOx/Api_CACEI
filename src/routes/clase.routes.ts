import { Router } from 'express';
import {
    registrarClase,
    obtenerClases,
    obtenerClasePorId,
    actualizarClase,
    eliminarClase
} from '../controllers/clase.controller';

const router = Router();

router.post('/', registrarClase);
router.get('/', obtenerClases);
router.get('/:id', obtenerClasePorId);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

export default router;