import { Request, Response } from 'express';
import { query } from '../database';

interface EvidenciaActividad {
    EvidenciaID?: number;
    ActividadID: number;
    TipoEvidencia: 'Foto' | 'Video' | 'Documento' | 'Enlace';
    URL: string;
    Descripcion?: string;
    FechaSubida?: Date;
}

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

export const registrarEvidenciaActividad = async (req: Request, res: Response) => {
    const { ActividadID, TipoEvidencia, URL, Descripcion } = req.body;

    console.log('📝 Datos recibidos:', { ActividadID, TipoEvidencia, URL, Descripcion });

    if (!ActividadID || !URL) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: ActividadID y URL.' });
    }

    const sql = `
        INSERT INTO EvidenciaActividad (ActividadID, TipoEvidencia, URL, Descripcion, FechaSubida)
        VALUES (?, ?, ?, ?, NOW())
    `;
    const values = [ActividadID, TipoEvidencia || 'Documento', URL, Descripcion || null];

    try {
        const result = await query(sql, values) as any;
        console.log('✅ Evidencia creada con ID:', result.insertId);
        res.status(201).json({
            message: 'Evidencia de actividad registrada exitosamente.',
            EvidenciaID: result.insertId
        });
    } catch (error) {
        console.error('❌ Error al crear evidencia:', error);
        let errorMessage = 'Error al registrar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El ActividadID proporcionado no existe.' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

export const obtenerEvidenciasActividades = async (req: Request, res: Response) => {
    try {
        console.log('🔍 Obteniendo evidencias de actividades...');

        const sql = `
            SELECT 
                EA.EvidenciaID,
                EA.ActividadID,
                EA.TipoEvidencia,
                EA.URL,
                EA.Descripcion,
                EA.FechaSubida,
                AP.Tipo AS ActividadTipo,
                AP.Fecha AS ActividadFecha,
                CONCAT(D.Nombre, ' ', D.Apellidos) AS DocenteNombre
            FROM EvidenciaActividad EA
            LEFT JOIN ActividadPromocion AP ON EA.ActividadID = AP.ActividadID
            LEFT JOIN Docente D ON AP.DocenteID = D.DocenteID
            ORDER BY EA.FechaSubida DESC
        `;

        const evidencias = await query(sql);
        console.log(`✅ Se encontraron ${evidencias.length} evidencias`);
        res.status(200).json(evidencias);
    } catch (error) {
        console.error('❌ Error al obtener evidencias:', error);
        let errorMessage = 'Error al obtener las evidencias.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerEvidenciasPorActividad = async (req: Request, res: Response) => {
    const { actividadId } = req.params;

    try {
        const sql = `
            SELECT 
                EvidenciaID,
                ActividadID,
                TipoEvidencia,
                URL,
                Descripcion,
                FechaSubida
            FROM EvidenciaActividad
            WHERE ActividadID = ?
            ORDER BY FechaSubida DESC
        `;
        const evidencias = await query(sql, [actividadId]);
        res.status(200).json(evidencias);
    } catch (error) {
        let errorMessage = 'Error al obtener las evidencias de la actividad.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarEvidenciaActividad = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { TipoEvidencia, URL, Descripcion } = req.body;

    if (!URL) {
        return res.status(400).json({ message: 'La URL es obligatoria.' });
    }

    const sql = `
        UPDATE EvidenciaActividad
        SET TipoEvidencia = ?, URL = ?, Descripcion = ?
        WHERE EvidenciaID = ?
    `;
    const values = [TipoEvidencia || 'Documento', URL, Descripcion || null, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evidencia no encontrada.' });
        }
        res.status(200).json({ message: 'Evidencia actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage, details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

export const eliminarEvidenciaActividad = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const sql = 'DELETE FROM EvidenciaActividad WHERE EvidenciaID = ?';
        const result = await query(sql, [id]) as any;

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Evidencia no encontrada.' });
        }

        res.status(200).json({ message: 'Evidencia eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la evidencia.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};