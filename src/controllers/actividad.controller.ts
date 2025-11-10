// src/controllers/actividad.controller.ts

import { Request, Response } from 'express';
import { query } from '../database';
import { ActividadPromocion } from '../interfaces/actividad.interface';

// Función de guardia de tipo (reutilizada para seguridad)
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
 * POST /api/actividades
 * Registra una nueva actividad de promoción.
 */
export const registrarActividad = async (req: Request, res: Response) => {
    const {
        DocenteID,
        PrepID,
        Tipo,
        Fecha,
        EstudiantesAlcanzados,
        CarrerasPromovidas,
        Observaciones,
        EvidenciasURL
    } = req.body as ActividadPromocion;

    // Validación de campos obligatorios
    if (!DocenteID || !Tipo || !Fecha || EstudiantesAlcanzados === undefined || EstudiantesAlcanzados === null) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para la actividad.' });
    }

    // Validación condicional (PrepID es obligatorio si no es Digital)
    if ((Tipo === 'Visitada' || Tipo === 'Invitada') && !PrepID) {
        return res.status(400).json({ message: `El campo PrepID (Preparatoria) es obligatorio para actividades de tipo ${Tipo}.` });
    }

    const finalPrepID = Tipo === 'Digital' ? null : PrepID;

    const sql = `
        INSERT INTO ActividadPromocion 
            (DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones, EvidenciasURL)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        DocenteID,
        finalPrepID,
        Tipo,
        Fecha,
        EstudiantesAlcanzados,
        CarrerasPromovidas || '',
        Observaciones || '',
        EvidenciasURL || null
    ];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: `Actividad de Promoción tipo ${Tipo} registrada exitosamente.`,
            ActividadID: result.insertId
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la actividad de promoción.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El DocenteID o PrepID proporcionado no existe.', details: errorMessage });
            }
        }

        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

/**
 * GET /api/actividades
 * Obtiene la lista completa de actividades con sus detalles (para RegistrosActividades.jsx).
 */
export const obtenerActividades = async (req: Request, res: Response) => {
    try {
        // Consulta avanzada para obtener los nombres en lugar de solo los IDs
        const sql = `
            SELECT 
                AP.ActividadID,
                AP.Tipo,
                AP.Fecha,
                AP.EstudiantesAlcanzados,
                AP.CarrerasPromovidas,
                AP.Observaciones,
                D.Nombre AS DocenteNombre,
                D.Apellidos AS DocenteApellidos,
                P.Nombre AS PreparatoriaNombre
            FROM 
                ActividadPromocion AP
            JOIN 
                Docente D ON AP.DocenteID = D.DocenteID
            LEFT JOIN 
                Preparatoria P ON AP.PrepID = P.PrepID
            ORDER BY
                AP.Fecha DESC;
        `;

        const actividades = await query(sql);
        res.status(200).json(actividades);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de actividades.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

/**
 * GET /api/actividades/:id
 * Obtiene una actividad por su ID.
 */
export const obtenerActividadPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM ActividadPromocion WHERE ActividadID = ?';
        const actividad = await query<ActividadPromocion>(sql, [id]);

        if (actividad.length === 0) {
            return res.status(404).json({ message: 'Actividad de Promoción no encontrada.' });
        }
        res.status(200).json(actividad[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la actividad.';
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
 * PUT /api/actividades/:id
 * Actualiza una actividad de promoción existente.
 */
export const actualizarActividad = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones, EvidenciasURL
    } = req.body as ActividadPromocion;

    // Validación mínima para actualización
    if (!DocenteID || !Tipo || !Fecha || EstudiantesAlcanzados === undefined || EstudiantesAlcanzados === null) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar la actividad.' });
    }

    const finalPrepID = Tipo === 'Digital' ? null : PrepID;

    const sql = `
        UPDATE ActividadPromocion 
        SET 
            DocenteID = ?, 
            PrepID = ?, 
            Tipo = ?, 
            Fecha = ?, 
            EstudiantesAlcanzados = ?, 
            CarrerasPromovidas = ?, 
            Observaciones = ?, 
            EvidenciasURL = ?
        WHERE ActividadID = ?
    `;
    const values = [
        DocenteID, finalPrepID, Tipo, Fecha, EstudiantesAlcanzados,
        CarrerasPromovidas || '', Observaciones || '', EvidenciasURL || null, id
    ];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Actividad de Promoción no encontrada para actualizar.' });
        }
        res.status(200).json({ message: 'Actividad actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la actividad de promoción.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El DocenteID o PrepID proporcionado no existe.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

/**
 * DELETE /api/actividades/:id
 * Elimina una actividad de promoción por su ID.
 */
export const eliminarActividad = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM ActividadPromocion WHERE ActividadID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Actividad de Promoción no encontrada para eliminar.' });
        }
        res.status(200).json({ message: 'Actividad eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la actividad.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};