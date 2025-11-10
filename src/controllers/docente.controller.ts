import { Request, Response } from 'express';
import { query } from '../database';
import { Docente } from '../interfaces/docente.interface';

// 💡 FUNCIÓN DE GUARDIA DE TIPO (Type Guard)
// Esta función verifica de forma segura si un error es un objeto con una propiedad 'message' de tipo string.
const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
};


/**
 * POST /api/docentes
 * Registra un nuevo docente en la base de datos.
 */
export const registrarDocente = async (req: Request, res: Response) => {
    const { Nombre, Apellidos, Correo, Especialidad, Departamento } = req.body as Docente;

    if (!Nombre || !Apellidos || !Correo || !Especialidad || !Departamento) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Nombre, Apellidos, Correo, Especialidad, Departamento.' });
    }

    const sql = `
        INSERT INTO Docente (Nombre, Apellidos, Correo, Especialidad, Departamento)
        VALUES (?, ?, ?, ?, ?)
    `;
    const values = [Nombre, Apellidos, Correo, Especialidad, Departamento];

    try {
        await query(sql, values);
        res.status(201).json({ message: 'Docente registrado exitosamente', docente: { Nombre, Correo } });
    } catch (error) {
        // --- Manejo del error con la guardia de tipo ---
        let errorMessage = 'Error desconocido al registrar el docente.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;

            // Manejo específico del error de MySQL por correo duplicado (o clave única)
            if (errorMessage.includes('Duplicate entry')) {
                return res.status(409).json({ message: 'El correo electrónico ya está registrado o hay datos duplicados.' });
            }
        }

        // Respuesta genérica de error si no se pudo manejar específicamente
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

/**
 * GET /api/docentes
 * Obtiene la lista completa de docentes
 */
export const obtenerDocentes = async (req: Request, res: Response) => {
    try {
        const docentes = await query<Docente>('SELECT DocenteID, Nombre, Apellidos, Correo FROM Docente');
        res.status(200).json(docentes);
    } catch (error) {
        // --- Manejo del error con la guardia de tipo ---
        let errorMessage = 'Error al obtener la lista de docentes.';

        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }

        res.status(500).json({ message: errorMessage });
    }
};