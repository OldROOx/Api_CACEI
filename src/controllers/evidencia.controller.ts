import { Request, Response } from 'express';
import { query } from '../database';
import { EvidenciaCurso } from '../interfaces/evidencia.interface';

const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
};

// ==========================================================
// C R E A T E
// ==========================================================

export const registrarEvidencia = async (req: Request, res: Response) => {
    const { EstudianteID, Titulo, Fecha, Status, ArchivoURL } = req.body as EvidenciaCurso;

    if (!EstudianteID || !Titulo || !Fecha || !Status) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Estudiante, Título, Fecha, y Estado.' });
    }

    const sql = `
        INSERT INTO EvidenciaCurso (EstudianteID, Titulo, Fecha, Status, ArchivoURL)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [EstudianteID, Titulo, Fecha, Status, ArchivoURL || null];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Evidencia registrada exitosamente.',
            EvidenciaID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El EstudianteID proporcionado no existe.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

export const obtenerEvidencias = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                EC.EvidenciaID, EC.Titulo, EC.Fecha, EC.Status, EC.ArchivoURL,
                E.Nombre AS EstudianteNombre, E.Correo AS EstudianteCorreo
            FROM 
                EvidenciaCurso EC
            JOIN Estudiante E ON EC.EstudianteID = E.EstudianteID
            ORDER BY EC.Fecha DESC;
        `;

        const evidencias = await query(sql);
        res.status(200).json(evidencias);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de evidencias.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerEvidenciaPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM EvidenciaCurso WHERE EvidenciaID = ?';
        const evidencia = await query<EvidenciaCurso>(sql, [id]);
        if (evidencia.length === 0) {
            return res.status(404).json({ message: 'Evidencia no encontrada.' });
        }
        res.status(200).json(evidencia[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarEvidencia = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { EstudianteID, Titulo, Fecha, Status, ArchivoURL } = req.body as EvidenciaCurso;

    if (!EstudianteID || !Titulo || !Fecha || !Status) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la evidencia.' });
    }

    const sql = `
        UPDATE EvidenciaCurso 
        SET EstudianteID = ?, Titulo = ?, Fecha = ?, Status = ?, ArchivoURL = ?
        WHERE EvidenciaID = ?
    `;
    const values = [EstudianteID, Titulo, Fecha, Status, ArchivoURL || null, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evidencia no encontrada para actualizar.' });
        }
        res.status(200).json({ message: 'Evidencia actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El EstudianteID proporcionado no existe.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

export const eliminarEvidencia = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM EvidenciaCurso WHERE EvidenciaID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evidencia no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Evidencia eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};