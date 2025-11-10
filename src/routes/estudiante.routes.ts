// src/routes/estudiante.routes.ts

import { Router } from 'express';
import {
    registrarEstudiante,
    obtenerEstudiantes,
    obtenerEstudiantePorId,
    actualizarEstudiante,
    eliminarEstudiante
} from '../controllers/estudiante.controller';

const router = Router();

// Rutas de Lectura y Creación (GET y POST a la colección)
router.post('/', registrarEstudiante);
router.get('/', obtenerEstudiantes);

// Rutas Específicas (GET, PUT y DELETE por ID)
router.get('/:id', obtenerEstudiantePorId);
router.put('/:id', actualizarEstudiante);
router.delete('/:id', eliminarEstudiante);

export default router;