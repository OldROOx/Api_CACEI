// src/routes/evidencia.routes.ts
import { Router } from 'express';
import {
    obtenerArchivosUploads,
    eliminarArchivoUploads
} from '../controllers/evidencia.controller';

const router = Router();

// Ruta para obtener todos los archivos de la carpeta uploads
router.get('/uploads', obtenerArchivosUploads);

// Ruta para eliminar un archivo específico de uploads
router.delete('/uploads/:nombreArchivo', eliminarArchivoUploads);

export default router;