// src/routes/preparatoria.routes.ts

import { Router } from 'express';
import { registrarPreparatoria, obtenerPreparatorias } from '../controllers/preparatoria.controller';

const router = Router();

// Ruta para el registro de preparatorias (POST)
router.post('/', registrarPreparatoria);

// Ruta para obtener todas las preparatorias (GET)
router.get('/', obtenerPreparatorias);

export default router;