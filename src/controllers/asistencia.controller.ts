import { Request, Response } from 'express';
import { query } from '../database';
// NOTA: Se asume que la interfaz RegistroAsistencia está definida en '../interfaces/asistencia.interface'
interface RegistroAsistencia {
    AsistenciaID?: number;
    ClaseID: number;
    EstudianteID: number;
    Fecha: string;
    Status: 'Presente' | 'Ausente';
}

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
// C R E A T E (TOMA DE ASISTENCIA MASIVA / UPSERT)
// ==========================================================

/**
 * POST /api/asistencia
 * Registra o actualiza la asistencia de múltiples estudiantes para una clase específica.
 */
export const registrarAsistenciaMasiva = async (req: Request, res: Response) => {
    const { registros } = req.body as { registros: RegistroAsistencia[] };

    if (!registros || registros.length === 0) {
        return res.status(400).json({ message: 'Debe proporcionar al menos un registro de asistencia.' });
    }

    // Construir la consulta de inserción masiva con UPSERT
    const sqlBase = 'INSERT INTO RegistroAsistencia (ClaseID, EstudianteID, Fecha, Status) VALUES ';
    const valuePlaceholders = registros.map(() => '(?, ?, ?, ?)').join(', ');
    // Si el registro ya existe (por UQ_Clase_Estudiante), actualiza Fecha y Status.
    const sql = sqlBase + valuePlaceholders + ' ON DUPLICATE KEY UPDATE Fecha = VALUES(Fecha), Status = VALUES(Status)';

    let values: (string | number)[] = [];
    registros.forEach(r => {
        if (!r.ClaseID || !r.EstudianteID || !r.Fecha || !r.Status) {
            throw new Error('Registro incompleto en la lista masiva.');
        }
        values.push(r.ClaseID, r.EstudianteID, r.Fecha, r.Status);
    });

    try {
        await query(sql, values);
        res.status(201).json({
            message: `Asistencia de ${registros.length} estudiantes registrada/actualizada exitosamente.`,
            ClaseID: registros[0].ClaseID
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: ClaseID o EstudianteID no existen.', details: errorMessage });
            }
        }

        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

/**
 * GET /api/asistencia/clase/:claseId
 * Obtiene el registro de asistencia de una clase específica, incluyendo detalles del estudiante.
 */
export const obtenerAsistenciaPorClase = async (req: Request, res: Response) => {
    const { claseId } = req.params;
    try {
        const sql = `
            SELECT 
                RA.AsistenciaID,
                RA.Fecha,
                RA.Status,
                E.EstudianteID,
                E.Nombre,
                E.Correo
            FROM 
                RegistroAsistencia RA
            JOIN 
                Estudiante E ON RA.EstudianteID = E.EstudianteID
            WHERE 
                RA.ClaseID = ?
            ORDER BY 
                E.Nombre ASC;
        `;

        const asistencia = await query(sql, [claseId]);
        res.status(200).json(asistencia);
    } catch (error) {
        let errorMessage = 'Error al obtener el registro de asistencia de la clase.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};


/**
 * GET /api/asistencia/resumen
 * Obtiene un resumen de asistencia reciente (para ControlAsistencia.jsx).
 */
export const obtenerResumenAsistencia = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT
                CN.ClaseID,
                CN.Titulo AS clase,
                CN.Fecha AS fecha,
                TIME_FORMAT(CN.Fecha, '%H:%i') AS hora,
                CONCAT(D.Nombre, ' ', D.Apellidos) AS instructor,
                SUM(CASE WHEN RA.Status = 'Presente' THEN 1 ELSE 0 END) AS presentes,
                COUNT(RA.EstudianteID) AS total
            FROM 
                ClaseNivelacion CN
            LEFT JOIN 
                RegistroAsistencia RA ON CN.ClaseID = RA.ClaseID
            JOIN
                Docente D ON CN.DocenteID = D.DocenteID
            GROUP BY
                CN.ClaseID, CN.Titulo, CN.Fecha, instructor
            ORDER BY 
                CN.Fecha DESC
            LIMIT 10;
        `;

        const resumen = await query(sql);
        res.status(200).json(resumen);
    } catch (error) {
        let errorMessage = 'Error al obtener el resumen de asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

/**
 * GET /api/asistencia/:id
 * Obtiene un registro de asistencia individual por su ID (AsistenciaID).
 */
export const obtenerAsistenciaPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM RegistroAsistencia WHERE AsistenciaID = ?';
        const registro = await query<RegistroAsistencia>(sql, [id]);

        if (registro.length === 0) {
            return res.status(404).json({ message: 'Registro de Asistencia no encontrado.' });
        }
        res.status(200).json(registro[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener el registro de asistencia.';
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
 * PUT /api/asistencia/:id
 * Actualiza un registro de asistencia individual por su ID (AsistenciaID).
 */
export const actualizarAsistencia = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { ClaseID, EstudianteID, Fecha, Status } = req.body as RegistroAsistencia;

    if (!ClaseID || !EstudianteID || !Fecha || !Status) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar el registro de asistencia.' });
    }

    const sql = `
        UPDATE RegistroAsistencia 
        SET ClaseID = ?, EstudianteID = ?, Fecha = ?, Status = ?
        WHERE AsistenciaID = ?
    `;
    const values = [ClaseID, EstudianteID, Fecha, Status, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro de Asistencia no encontrado para actualizar.' });
        }
        res.status(200).json({ message: 'Registro de Asistencia actualizado exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar el registro de asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: ClaseID o EstudianteID proporcionado no existe.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

/**
 * DELETE /api/asistencia/:id
 * Elimina un registro de asistencia individual por su ID (AsistenciaID).
 */
export const eliminarAsistencia = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM RegistroAsistencia WHERE AsistenciaID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Registro de Asistencia no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Registro de Asistencia eliminado exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar el registro de asistencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = errorMessage;
        }
        res.status(500).json({ message: errorMessage });
    }
};