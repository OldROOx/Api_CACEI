// src/middleware/upload.ts

import multer from 'multer';
import path from 'path';

// Define la configuración de almacenamiento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Carpeta 'uploads/' en la raíz de la API
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Generar un nombre de archivo único para evitar conflictos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// =========================================================================
// FILTRO DE ARCHIVOS: SOPORTE PARA IMÁGENES, PDF Y EXCEL
// =========================================================================
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {

    const allowedMimeTypes = [
        // Imágenes
        'image/jpeg',
        'image/png',
        // Documentos
        'application/pdf',
        // Excel (.xls y .xlsx)
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false); // Rechazar el archivo
    }
};

// Tamaño máximo del archivo (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const upload = multer({
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: fileFilter
});

// Exporta el middleware para manejar un solo archivo en el campo 'evidencia' (nombre usado en el frontend FormData)
export const uploadFileMiddleware = upload.single('evidencia');