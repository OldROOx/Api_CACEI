import { Request, Response } from 'express';
import { query } from '../database';
import { Asistencia } from '../interfaces/asistencia.interface';

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

export const registrarAsistencia = async (req: Request, res: Response) => {
    const { ClaseID, EstudianteID, Presente } = req.body;

    if (!ClaseID || !EstudianteID || Presente === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: ClaseID, EstudianteID y Presente.' });
    }

    const sql = `
        INSERT INTO Asistencia (ClaseID, EstudianteID, Presente)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE Presente = VALUES(Presente)
    `;
    const values = [ClaseID, EstudianteID, Presente];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Asistencia registrada exitosamente.',
            AsistenciaID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

export const obtenerAsistencias = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                A.*,
                CONCAT(E.Nombre, ' ', E.Apellidos) AS EstudianteNombre,
                C.Materia,
                C.Fecha
            FROM Asistencia A
            JOIN Estudiante E ON A.EstudianteID = E.EstudianteID
            JOIN Clase C ON A.ClaseID = C.ClaseID
            ORDER BY A.FechaRegistro DESC
        `;
        const asistencias = await query(sql);
        res.status(200).json(asistencias);
    } catch (error) {
        let errorMessage = 'Error al obtener las asistencias.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerAsistenciaPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM Asistencia WHERE AsistenciaID = ?';
        const asistencia = await query(sql, [id]);
        if (asistencia.length === 0) {
            return res.status(404).json({ message: 'Asistencia no encontrada.' });
        }
        res.status(200).json(asistencia[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerAsistenciasPorClase = async (req: Request, res: Response) => {
    const { claseId } = req.params;
    try {
        const sql = `
            SELECT 
                A.*,
                CONCAT(E.Nombre, ' ', E.Apellidos) AS EstudianteNombre,
                E.Matricula
            FROM Asistencia A
            JOIN Estudiante E ON A.EstudianteID = E.EstudianteID
            WHERE A.ClaseID = ?
            ORDER BY E.Nombre, E.Apellidos
        `;
        const asistencias = await query(sql, [claseId]);
        res.status(200).json(asistencias);
    } catch (error) {
        let errorMessage = 'Error al obtener las asistencias de la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarAsistencia = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ClaseID, EstudianteID, Presente } = req.body;

    if (!ClaseID || !EstudianteID || Presente === undefined) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const sql = `
        UPDATE Asistencia 
        SET ClaseID = ?, EstudianteID = ?, Presente = ?
        WHERE AsistenciaID = ?
    `;
    const values = [ClaseID, EstudianteID, Presente, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Asistencia no encontrada.' });
        }
        res.status(200).json({ message: 'Asistencia actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage, details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

export const eliminarAsistencia = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM Asistencia WHERE AsistenciaID = ?';
        const result = await query(sql, [id]) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Asistencia no encontrada.' });
        }
        res.status(200).json({ message: 'Asistencia eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};