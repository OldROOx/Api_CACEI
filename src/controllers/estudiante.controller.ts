// src/controllers/estudiante.controller.ts

import { Request, Response } from 'express';
import { query } from '../database';
import { Estudiante } from '../interfaces/estudiante.interface';

// Función de guardia de tipo (reutilizada)
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

/**
 * POST /api/estudiantes
 * Registra un nuevo estudiante.
 */
export const registrarEstudiante = async (req: Request, res: Response) => {
    const { Nombre, Correo } = req.body as Estudiante;

    if (!Nombre || !Correo) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Nombre y Correo.' });
    }

    const sql = 'INSERT INTO Estudiante (Nombre, Correo) VALUES (?, ?)';
    const values = [Nombre, Correo];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Estudiante registrado exitosamente.',
            EstudianteID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar el estudiante.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Duplicate entry')) {
                return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
            }
        }

        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

/**
 * GET /api/estudiantes
 * Obtiene la lista completa de estudiantes.
 */
export const obtenerEstudiantes = async (req: Request, res: Response) => {
    try {
        const estudiantes = await query<Estudiante>('SELECT EstudianteID, Nombre, Correo FROM Estudiante ORDER BY Nombre ASC');
        res.status(200).json(estudiantes);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de estudiantes.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

/**
 * GET /api/estudiantes/:id
 * Obtiene un estudiante por su ID.
 */
export const obtenerEstudiantePorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT EstudianteID, Nombre, Correo FROM Estudiante WHERE EstudianteID = ?';
        const estudiante = await query<Estudiante>(sql, [id]);

        if (estudiante.length === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }
        res.status(200).json(estudiante[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener el estudiante.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

/**
 * PUT /api/estudiantes/:id
 * Actualiza un estudiante existente.
 */
export const actualizarEstudiante = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { Nombre, Correo } = req.body as Estudiante;

    if (!Nombre || !Correo) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar el estudiante.' });
    }

    const sql = 'UPDATE Estudiante SET Nombre = ?, Correo = ? WHERE EstudianteID = ?';
    const values = [Nombre, Correo, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Estudiante actualizado exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar el estudiante.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Duplicate entry')) {
                return res.status(409).json({ message: 'El correo electrónico ya está en uso por otro estudiante.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

/**
 * DELETE /api/estudiantes/:id
 * Elimina un estudiante por su ID.
 */
export const eliminarEstudiante = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM Estudiante WHERE EstudianteID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Estudiante eliminado exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar el estudiante.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};