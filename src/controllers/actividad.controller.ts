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
// C R E A T E (Modificado para File Upload)
// ==========================================================

export const registrarActividad = async (req: Request, res: Response) => {
    // Los datos se leen directamente de req.body (todo es string o undefined)
    const {
        DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados,
        CarrerasPromovidas, Observaciones
    } = req.body;

    // 1. Determinar la URL del archivo
    const EvidenciasURL = req.file ? `/uploads/${req.file.filename}` : null;

    // 2. Convertir los campos a sus tipos esperados
    const docenteID = parseInt(DocenteID as string);
    const prepID = PrepID ? parseInt(PrepID as string) : null;
    const estudiantesAlcanzados = parseInt(EstudiantesAlcanzados as string);
    const tipo = Tipo as ActividadPromocion['Tipo'];

    // 3. VALIDACIÓN
    if (!docenteID || !tipo || !Fecha || isNaN(estudiantesAlcanzados) || estudiantesAlcanzados === null) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para la actividad.' });
    }
    const finalPrepID = (tipo === 'Visitada' || tipo === 'Invitada') ? prepID : null;
    if ((tipo === 'Visitada' || tipo === 'Invitada') && !finalPrepID) {
        return res.status(400).json({ message: `El campo PrepID (Preparatoria) es obligatorio para actividades de tipo ${tipo}.` });
    }

    const sql = `
        INSERT INTO ActividadPromocion 
            (DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones, EvidenciasURL)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        docenteID, finalPrepID, tipo, Fecha, estudiantesAlcanzados,
        CarrerasPromovidas || '', Observaciones || '', EvidenciasURL
    ];

    try {
        const result = await query(sql, values) as any;
        res.status(201).json({
            message: `Actividad de Promoción tipo ${tipo} registrada exitosamente.`,
            ActividadID: result.insertId,
            archivo: EvidenciasURL
        });
    } catch (error) {
        let errorMessage = 'Error al registrar la actividad de promoción.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
            if (errorMessage.includes('Cannot add or update a child row')) {
                return res.status(404).json({ message: 'Error de relación: El DocenteID o PrepID proporcionado no existe.' });
            }
            if (errorMessage.includes('File too large')) {
                return res.status(413).json({ message: 'El archivo es demasiado grande (máx. 5MB).' });
            }
        }
        res.status(500).json({ message: 'Error interno del servidor.', details: errorMessage });
    }
};

// ... (El resto de las funciones CRUD (READ, UPDATE, DELETE) que ya habías recibido quedan igual)
export const obtenerActividades = async (req: Request, res: Response) => { /* ... */ };
export const obtenerActividadPorId = async (req: Request, res: Response) => { /* ... */ };
export const actualizarActividad = async (req: Request, res: Response) => { /* ... */ };
export const eliminarActividad = async (req: Request, res: Response) => { /* ... */ };