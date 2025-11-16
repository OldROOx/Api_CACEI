import { Request, Response } from 'express';
import { query } from '../database';
import { Clase } from '../interfaces/clase.interface';

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

export const registrarClase = async (req: Request, res: Response) => {
    const { DocenteID, Materia, Fecha, Horario, Tema, Salon, Observaciones } = req.body;

    if (!DocenteID || !Materia || !Fecha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: DocenteID, Materia y Fecha.' });
    }

    const sql = `
        INSERT INTO Clase (DocenteID, Materia, Fecha, Horario, Tema, Salon, Observaciones)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [DocenteID, Materia, Fecha, Horario, Tema, Salon, Observaciones];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Clase registrada exitosamente.',
            ClaseID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

export const obtenerClases = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                C.*,
                CONCAT(D.Nombre, ' ', D.Apellidos) AS DocenteNombre
            FROM Clase C
            JOIN Docente D ON C.DocenteID = D.DocenteID
            ORDER BY C.Fecha DESC
        `;
        const clases = await query(sql);
        res.status(200).json(clases);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de clases.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerClasePorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = `
            SELECT 
                C.*,
                CONCAT(D.Nombre, ' ', D.Apellidos) AS DocenteNombre
            FROM Clase C
            JOIN Docente D ON C.DocenteID = D.DocenteID
            WHERE C.ClaseID = ?
        `;
        const clase = await query(sql, [id]);
        if (clase.length === 0) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }
        res.status(200).json(clase[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarClase = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { DocenteID, Materia, Fecha, Horario, Tema, Salon, Observaciones } = req.body;

    if (!DocenteID || !Materia || !Fecha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const sql = `
        UPDATE Clase 
        SET DocenteID = ?, Materia = ?, Fecha = ?, Horario = ?, Tema = ?, Salon = ?, Observaciones = ?
        WHERE ClaseID = ?
    `;
    const values = [DocenteID, Materia, Fecha, Horario, Tema, Salon, Observaciones, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }
        res.status(200).json({ message: 'Clase actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage, details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

export const eliminarClase = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM Clase WHERE ClaseID = ?';
        const result = await query(sql, [id]) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clase no encontrada.' });
        }
        res.status(200).json({ message: 'Clase eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};