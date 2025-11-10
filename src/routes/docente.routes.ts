import { Router } from 'express';
import { registrarDocente, obtenerDocentes } from '../controllers/docente.controller';

const router = Router();

// Ruta para el registro de docentes (POST)
router.post('/', registrarDocente);

// Ruta para obtener todos los docentes (GET)
router.get('/', obtenerDocentes);

export default router;