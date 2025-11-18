// src/controllers/evidencia.controller.ts
import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
};

// ==========================================================
// LISTAR ARCHIVOS DE LA CARPETA UPLOADS
// ==========================================================

export const obtenerArchivosUploads = async (req: Request, res: Response) => {
    try {
        const uploadsPath = path.join(__dirname, '../../uploads');

        console.log('📁 Leyendo carpeta uploads desde:', uploadsPath);

        // Verificar si la carpeta existe
        if (!fs.existsSync(uploadsPath)) {
            console.log('⚠️ La carpeta uploads no existe, creándola...');
            fs.mkdirSync(uploadsPath, { recursive: true });
            return res.status(200).json({
                total: 0,
                archivos: []
            });
        }

        // Leer todos los archivos de la carpeta
        const archivos = fs.readdirSync(uploadsPath);

        console.log(`📎 Se encontraron ${archivos.length} archivos en uploads`);

        // Filtrar solo archivos (no directorios) y obtener información detallada
        const archivosInfo = archivos
            .filter(archivo => {
                try {
                    const rutaCompleta = path.join(uploadsPath, archivo);
                    return fs.statSync(rutaCompleta).isFile();
                } catch (error) {
                    console.error(`Error al leer archivo ${archivo}:`, error);
                    return false;
                }
            })
            .map((archivo, index) => {
                const rutaCompleta = path.join(uploadsPath, archivo);
                const stats = fs.statSync(rutaCompleta);
                const extension = path.extname(archivo).toLowerCase();

                // Detectar tipo de archivo
                let tipoArchivo = 'Documento';
                if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(extension)) {
                    tipoArchivo = 'Foto';
                } else if (['.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv', '.webm'].includes(extension)) {
                    tipoArchivo = 'Video';
                } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(extension)) {
                    tipoArchivo = 'Documento';
                }

                return {
                    id: index + 1,
                    nombreArchivo: archivo,
                    tipo: tipoArchivo,
                    extension: extension.replace('.', ''),
                    tamaño: stats.size,
                    tamañoLegible: formatBytes(stats.size),
                    fechaCreacion: stats.birthtime,
                    fechaModificacion: stats.mtime,
                    url: `/uploads/${archivo}`
                };
            })
            // Ordenar por fecha de modificación (más reciente primero)
            .sort((a, b) => b.fechaModificacion.getTime() - a.fechaModificacion.getTime());

        console.log(`✅ Devolviendo ${archivosInfo.length} archivos`);

        res.status(200).json({
            total: archivosInfo.length,
            archivos: archivosInfo
        });

    } catch (error) {
        console.error('❌ Error al leer carpeta uploads:', error);
        let errorMessage = 'Error al obtener archivos de uploads.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({
            message: errorMessage,
            total: 0,
            archivos: []
        });
    }
};

// ==========================================================
// ELIMINAR ARCHIVO DE UPLOADS
// ==========================================================

export const eliminarArchivoUploads = async (req: Request, res: Response) => {
    try {
        const { nombreArchivo } = req.params;
        const uploadsPath = path.join(__dirname, '../../uploads');
        const rutaArchivo = path.join(uploadsPath, nombreArchivo);

        console.log('🗑️ Intentando eliminar archivo:', rutaArchivo);

        // Verificar que el archivo existe
        if (!fs.existsSync(rutaArchivo)) {
            return res.status(404).json({ message: 'Archivo no encontrado.' });
        }

        // Verificar que es un archivo (no un directorio)
        if (!fs.statSync(rutaArchivo).isFile()) {
            return res.status(400).json({ message: 'No se puede eliminar: no es un archivo.' });
        }

        // Eliminar el archivo
        fs.unlinkSync(rutaArchivo);
        console.log('✅ Archivo eliminado exitosamente');

        res.status(200).json({
            message: 'Archivo eliminado exitosamente.',
            nombreArchivo: nombreArchivo
        });

    } catch (error) {
        console.error('❌ Error al eliminar archivo:', error);
        let errorMessage = 'Error al eliminar el archivo.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// HELPER FUNCTIONS
// ==========================================================

function formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

