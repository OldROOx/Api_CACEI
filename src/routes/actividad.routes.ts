// src/routes/actividad.routes.ts

import { Router } from 'express';
import {
    registrarActividad,
    obtenerActividades,
    obtenerActividadPorId,
    actualizarActividad,
    eliminarActividad
} from '../controllers/actividad.controller';

const router = Router();

// Rutas de Lectura y Creación (GET y POST a la colección)
router.post('/', registrarActividad);
router.get('/', obtenerActividades);

// Rutas Específicas (GET, PUT y DELETE por ID)
router.get('/:id', obtenerActividadPorId);
router.put('/:id', actualizarActividad);
router.delete('/:id', eliminarActividad);

export default router;