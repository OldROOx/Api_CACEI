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
// FILTRO DE ARCHIVOS: SOPORTE PARA IMÁGENES, PDF, EXCEL Y WORD
// =========================================================================
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {

    const allowedMimeTypes = [
        // Imágenes
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // Documentos
        'application/pdf',
        // Excel (.xls y .xlsx)
        'application/vnd.ms-excel', // .xls
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        // Word (.doc y .docx)
        'application/msword', // .doc
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(null, false); // Rechazar el archivo
    }
};

// Tamaño máximo del archivo (10MB por archivo)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_FILE_SIZE,
        files: 5 // Máximo 5 archivos a la vez
    },
    fileFilter: fileFilter
});

// ✅ CAMBIO CLAVE: Ahora acepta hasta 5 archivos en el campo 'evidencias'
export const uploadFileMiddleware = upload.array('evidencias', 5);