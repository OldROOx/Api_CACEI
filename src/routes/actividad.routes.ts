// src/routes/actividad.routes.ts

import { Router } from 'express';
import {
    registrarActividad,
    obtenerActividades,
    obtenerActividadPorId,
    actualizarActividad,
    eliminarActividad
} from '../controllers/actividad.controller';
import { uploadFileMiddleware } from '../middleware/upload'; // <-- Importación del Middleware

const router = Router();

// El POST utiliza el middleware de subida antes del controlador
router.post('/', uploadFileMiddleware, registrarActividad);
router.get('/', obtenerActividades);

// Rutas Específicas (GET, PUT y DELETE por ID)
router.get('/:id', obtenerActividadPorId);
router.put('/:id', actualizarActividad);
router.delete('/:id', eliminarActividad);

export default router;