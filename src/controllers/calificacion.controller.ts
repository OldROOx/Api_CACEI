import { Request, Response } from 'express';
import { query } from '../database';
import { CalificacionInduccion } from '../interfaces/calificacion.interface';

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

export const registrarCalificacion = async (req: Request, res: Response) => {
    const { EstudianteID, Titulo, PuntuacionTotal, FechaRegistro, ArchivoFuente } = req.body as CalificacionInduccion;

    if (!EstudianteID || !Titulo || PuntuacionTotal === undefined || PuntuacionTotal === null || !FechaRegistro) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Estudiante, Título, Puntuación Total y Fecha de Registro.' });
    }

    const sql = `
        INSERT INTO CalificacionInduccion (EstudianteID, Titulo, PuntuacionTotal, FechaRegistro, ArchivoFuente)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [EstudianteID, Titulo, PuntuacionTotal, FechaRegistro, ArchivoFuente || null];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Calificación registrada exitosamente.',
            CalificacionID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la calificación.';
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

export const obtenerCalificaciones = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                CI.CalificacionID, CI.Titulo, CI.PuntuacionTotal, CI.FechaRegistro, CI.ArchivoFuente,
                E.Nombre AS EstudianteNombre
            FROM 
                CalificacionInduccion CI
            JOIN Estudiante E ON CI.EstudianteID = E.EstudianteID
            ORDER BY CI.FechaRegistro DESC;
        `;

        const calificaciones = await query(sql);
        res.status(200).json(calificaciones);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de calificaciones.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerCalificacionPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM CalificacionInduccion WHERE CalificacionID = ?';
        const calificacion = await query<CalificacionInduccion>(sql, [id]);
        if (calificacion.length === 0) {
            return res.status(404).json({ message: 'Calificación no encontrada.' });
        }
        res.status(200).json(calificacion[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la calificación.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarCalificacion = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { EstudianteID, Titulo, PuntuacionTotal, FechaRegistro, ArchivoFuente } = req.body as CalificacionInduccion;

    if (!EstudianteID || !Titulo || PuntuacionTotal === undefined || PuntuacionTotal === null || !FechaRegistro) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la calificación.' });
    }

    const sql = `
        UPDATE CalificacionInduccion 
        SET EstudianteID = ?, Titulo = ?, PuntuacionTotal = ?, FechaRegistro = ?, ArchivoFuente = ?
        WHERE CalificacionID = ?
    `;
    const values = [EstudianteID, Titulo, PuntuacionTotal, FechaRegistro, ArchivoFuente || null, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Calificación no encontrada para actualizar.' });
        }
        res.status(200).json({ message: 'Calificación actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la calificación.';
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

export const eliminarCalificacion = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM CalificacionInduccion WHERE CalificacionID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Calificación no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Calificación eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la calificación.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};