// src/routes/clase.routes.ts

import { Router } from 'express';
import {
    registrarClase,
    obtenerClases,
    obtenerClasePorId,
    actualizarClase,
    eliminarClase
} from '../controllers/clase.controller';

const router = Router();

// Rutas de Lectura y Creación (GET y POST a la colección)
router.post('/', registrarClase);
router.get('/', obtenerClases);

// Rutas Específicas (GET, PUT y DELETE por ID)
router.get('/:id', obtenerClasePorId);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

export default router;