// src/controllers/preparatoria.controller.ts

import { Request, Response } from 'express';
import { query } from '../database';
import { Preparatoria } from '../interfaces/preparatoria.interface';

// Asegúrate de incluir la función de guardia de tipo aquí también
const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
};


/**
 * POST /api/preparatorias
 * Registra una nueva preparatoria.
 */
export const registrarPreparatoria = async (req: Request, res: Response) => {
    // Extraemos los campos del body basados en la interfaz y el formulario
    const {
        Nombre, Clave, Tipo, Ciudad, Estado, Director,
        // Campos extra del formulario que no están en la tabla actual de la DB:
        Telefono, CorreoElectronico, CoordinadorVinculacion, NotasAdicionales
    } = req.body as Preparatoria;

    // Validación de campos requeridos (Nombre, Tipo, Ciudad, Estado)
    if (!Nombre || !Tipo || !Ciudad || !Estado) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Nombre, Tipo, Ciudad, Estado.' });
    }

    // Consulta SQL usando solo los campos definidos en tu tabla Preparatoria
    const sql = `
        INSERT INTO Preparatoria (Nombre, Clave, Tipo, Ciudad, Estado, Director)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [Nombre, Clave, Tipo, Ciudad, Estado, Director];

    try {
        await query(sql, values);
        res.status(201).json({ message: 'Preparatoria registrada exitosamente', preparatoria: { Nombre, Ciudad } });
    } catch (error) {
        let errorMessage = 'Error desconocido al registrar la preparatoria.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;

            // Manejo de error de clave única si se implementara en la DB
            if (errorMessage.includes('Duplicate entry')) {
                return res.status(409).json({ message: 'Una preparatoria con esta Clave/Nombre ya existe.' });
            }
        }

        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

/**
 * GET /api/preparatorias
 * Obtiene la lista completa de preparatorias
 */
export const obtenerPreparatorias = async (req: Request, res: Response) => {
    try {
        const preparatorias = await query<Preparatoria>('SELECT PrepID, Nombre, Tipo, Ciudad, Estado FROM Preparatoria');
        res.status(200).json(preparatorias);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de preparatorias.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }

        res.status(500).json({ message: errorMessage });
    }
};