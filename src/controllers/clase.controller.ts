// src/controllers/clase.controller.ts

import { Request, Response } from 'express';
import { query } from '../database';
import { ClaseNivelacion } from '../interfaces/clase.interface';

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
 * POST /api/clases
 * Registra una nueva clase de nivelación.
 */
export const registrarClase = async (req: Request, res: Response) => {
    const { DocenteID, Titulo, Status, Fecha, Ubicacion } = req.body as ClaseNivelacion;

    // Validación de campos obligatorios
    if (!DocenteID || !Titulo || !Status || !Fecha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Docente, Título, Estado y Fecha.' });
    }

    const sql = `
        INSERT INTO ClaseNivelacion (DocenteID, Titulo, Status, Fecha, Ubicacion)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [DocenteID, Titulo, Status, Fecha, Ubicacion || null];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: 'Clase programada exitosamente.',
            ClaseID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la clase.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            // Manejo de error de clave foránea (si DocenteID no existe)
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El DocenteID proporcionado no existe.', details: errorMessage });
            }
        }

        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

/**
 * GET /api/clases
 * Obtiene la lista completa de clases de nivelación.
 */
export const obtenerClases = async (req: Request, res: Response) => {
    try {
        // Consulta para obtener el nombre del docente junto con los detalles de la clase
        const sql = `
            SELECT 
                C.ClaseID,
                C.Titulo,
                C.Status,
                C.Fecha,
                C.Ubicacion,
                D.DocenteID,
                CONCAT(D.Nombre, ' ', D.Apellidos) AS DocenteNombreCompleto
            FROM 
                ClaseNivelacion C
            JOIN 
                Docente D ON C.DocenteID = D.DocenteID
            ORDER BY
                C.Fecha DESC;
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

/**
 * GET /api/clases/:id
 * Obtiene una clase por su ID.
 */
export const obtenerClasePorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM ClaseNivelacion WHERE ClaseID = ?';
        const clase = await query<ClaseNivelacion>(sql, [id]);

        if (clase.length === 0) {
            return res.status(404).json({ message: 'Clase de Nivelación no encontrada.' });
        }
        res.status(200).json(clase[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la clase.';
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
 * PUT /api/clases/:id
 * Actualiza una clase de nivelación existente.
 */
export const actualizarClase = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { DocenteID, Titulo, Status, Fecha, Ubicacion } = req.body as ClaseNivelacion;

    // Validación mínima para actualización
    if (!DocenteID || !Titulo || !Status || !Fecha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la clase.' });
    }

    const sql = `
        UPDATE ClaseNivelacion 
        SET 
            DocenteID = ?, 
            Titulo = ?, 
            Status = ?, 
            Fecha = ?, 
            Ubicacion = ?
        WHERE ClaseID = ?
    `;
    const values = [DocenteID, Titulo, Status, Fecha, Ubicacion || null, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clase de Nivelación no encontrada para actualizar.' });
        }
        res.status(200).json({ message: 'Clase actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El DocenteID proporcionado no existe.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

/**
 * DELETE /api/clases/:id
 * Elimina una clase de nivelación por su ID.
 */
export const eliminarClase = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM ClaseNivelacion WHERE ClaseID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Clase de Nivelación no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Clase eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};