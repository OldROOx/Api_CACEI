// src/routes/evidencia.routes.ts

import { Router } from 'express';
import {
    registrarEvidencia,
    obtenerEvidencias,
    obtenerEvidenciaPorId,
    actualizarEvidencia,
    eliminarEvidencia
} from '../controllers/evidencia.controller';
import { uploadFileMiddleware } from '../middleware/upload'; // <-- Importación del Middleware

const router = Router();

// El POST utiliza el middleware de subida
router.post('/', uploadFileMiddleware, registrarEvidencia);
router.get('/', obtenerEvidencias);
router.get('/:id', obtenerEvidenciaPorId);
router.put('/:id', actualizarEvidencia);
router.delete('/:id', eliminarEvidencia);

export default router;