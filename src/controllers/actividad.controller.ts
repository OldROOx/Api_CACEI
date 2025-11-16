import { Request, Response } from 'express';
import { query } from '../database';
import { ActividadPromocion } from '../interfaces/actividad.interface';

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
// C R E A T E (Modificado para múltiples archivos)
// ==========================================================

export const registrarActividad = async (req: Request, res: Response) => {
    const {
        DocenteID,
        PreparatoriaID,
        Tipo,
        Fecha,
        EstudiantesAlcanzados,
        CarrerasPromovidas,
        Observaciones
    } = req.body;

    // ✅ CAMBIO: Ahora maneja múltiples archivos
    let EvidenciasURL = null;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
        // Guarda las URLs separadas por comas
        const urls = req.files.map(file => `/uploads/${file.filename}`);
        EvidenciasURL = urls.join(',');
    }

    const docenteID = parseInt(DocenteID as string);
    const estudiantesAlcanzados = parseInt(EstudiantesAlcanzados as string);
    const tipo = Tipo as ActividadPromocion['Tipo'];
    const prepID = PreparatoriaID ? parseInt(PreparatoriaID as string) : null;

    // Validación
    if (!docenteID || !tipo || !Fecha || isNaN(estudiantesAlcanzados) || estudiantesAlcanzados <= 0) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Docente, Tipo, Fecha, Estudiantes (> 0).' });
    }

    const isPrepRequired = (tipo as string !== 'Digital');
    const finalPrepID = isPrepRequired ? prepID : null;

    if (isPrepRequired && !finalPrepID) {
        return res.status(400).json({ message: `El campo PrepID (Preparatoria) es obligatorio para actividades de tipo ${tipo}.` });
    }

    const carrerasPromovidasStr = Array.isArray(CarrerasPromovidas)
        ? CarrerasPromovidas.join(',')
        : CarrerasPromovidas || '';

    const sql = `
        INSERT INTO ActividadPromocion 
            (DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones, EvidenciasURL)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        docenteID, finalPrepID, tipo, Fecha, estudiantesAlcanzados,
        carrerasPromovidasStr, Observaciones || '', EvidenciasURL
    ];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: `Actividad de Promoción tipo ${tipo} registrada exitosamente.`,
            ActividadID: result.insertId,
            archivos: EvidenciasURL ? EvidenciasURL.split(',') : [],
            totalArchivos: req.files && Array.isArray(req.files) ? req.files.length : 0
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la actividad de promoción.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El DocenteID o PrepID proporcionado no existe.' });
            }
            if (errorMessage.includes('File too large')) {
                return res.status(413).json({ message: 'El archivo es demasiado grande (máx. 10MB por archivo).' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ==========================================================
// R E A D
// ==========================================================

export const obtenerActividades = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                AP.*,
                CONCAT(D.Nombre, ' ', D.Apellidos) AS DocenteNombre,
                P.Nombre AS PreparatoriaNombre
            FROM ActividadPromocion AP
            JOIN Docente D ON AP.DocenteID = D.DocenteID
            LEFT JOIN Preparatoria P ON AP.PrepID = P.PrepID
            ORDER BY AP.Fecha DESC
        `;
        const actividades = await query(sql);
        res.status(200).json(actividades);
    } catch (error) {
        let errorMessage = 'Error al obtener actividades.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerActividadPorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM ActividadPromocion WHERE ActividadID = ?';
        const actividad = await query<ActividadPromocion>(sql, [id]);
        if (actividad.length === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada.' });
        }
        res.status(200).json(actividad[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener la actividad.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarActividad = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones } = req.body;

    if (!DocenteID || !Tipo || !Fecha) {
        return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    }

    const sql = `
        UPDATE ActividadPromocion 
        SET DocenteID = ?, PrepID = ?, Tipo = ?, Fecha = ?, EstudiantesAlcanzados = ?, CarrerasPromovidas = ?, Observaciones = ?
        WHERE ActividadID = ?
    `;
    const values = [DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones, id];

    try {
        const result = await query(sql, values) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada.' });
        }
        res.status(200).json({ message: 'Actividad actualizada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al actualizar la actividad.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage, details: errorMessage });
    }
};

// ==========================================================
// D E L E T E
// ==========================================================

export const eliminarActividad = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM ActividadPromocion WHERE ActividadID = ?';
        const result = await query(sql, [id]) as any;
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Actividad no encontrada.' });
        }
        res.status(200).json({ message: 'Actividad eliminada exitosamente.' });
    } catch (error) {
        let errorMessage = 'Error al eliminar la actividad.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};