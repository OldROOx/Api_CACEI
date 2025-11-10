import { Request, Response } from 'express';
import { query } from '../database';
// Suponiendo que la interfaz se llama EvidenciaCurso
interface EvidenciaCurso {
    EvidenciaID?: number;
    EstudianteID: number;
    Titulo: string;
    Fecha: string;
    Status: 'Aprobado' | 'Pendiente' | 'Rechazado';
    ArchivoURL?: string;
}

const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
};

// ==========================================================
// C R E A T E (Modificado para File Upload)
// ==========================================================

export const registrarEvidencia = async (req: Request, res: Response) => {
    // req.body contiene los campos de texto; req.file contiene el archivo.
    const { EstudianteID, Titulo, Fecha, Status } = req.body;

    // 1. Obtener la URL del archivo
    const ArchivoURL = req.file ? `/uploads/${req.file.filename}` : null;

    // 2. Convertir a tipos esperados
    const estudianteID = parseInt(EstudianteID as string);
    const status = Status as EvidenciaCurso['Status'];

    if (!estudianteID || !Titulo || !Fecha || !status) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: EstudianteID, Título, Fecha, y Estado.' });
    }

    const sql = `
        INSERT INTO EvidenciaCurso (EstudianteID, Titulo, Fecha, Status, ArchivoURL)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [estudianteID, Titulo, Fecha, status, ArchivoURL];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Evidencia registrada exitosamente.',
            EvidenciaID: result.insertId,
            archivo: ArchivoURL
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El EstudianteID proporcionado no existe.' });
            }
            if (errorMessage.includes('File too large')) {
                return res.status(413).json({ message: 'El archivo es demasiado grande (máx. 5MB).' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ... (El resto de las funciones CRUD (READ, UPDATE, DELETE) que ya habías recibido quedan igual)
export const obtenerEvidencias = async (req: Request, res: Response) => { /* ... */ };
export const obtenerEvidenciaPorId = async (req: Request, res: Response) => { /* ... */ };
export const actualizarEvidencia = async (req: Request, res: Response) => { /* ... */ };
export const eliminarEvidencia = async (req: Request, res: Response) => { /* ... */ };