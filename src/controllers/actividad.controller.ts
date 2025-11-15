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
// C R E A T E (Modificado para sincronizar Frontend/Backend)
// ==========================================================

export const registrarActividad = async (req: Request, res: Response) => {
    // Los datos se leen directamente de req.body (todo es string o undefined)
    const {
        NombreActividad, // Campo de título del frontend
        DocenteID,
        PreparatoriaID,
        Tipo,
        Fecha,
        EstudiantesAlcanzados,
        CarrerasPromovidas,
        Observaciones
    } = req.body;

    // 1. Determinar la URL del archivo
    const EvidenciasURL = req.file ? `/uploads/${req.file.filename}` : null;

    // 2. Convertir y mapear los campos a sus tipos esperados para la DB
    const nombre = (NombreActividad as string)?.trim() || 'Actividad Registrada'; // Nombre saneado (usa valor por defecto)
    const docenteID = parseInt(DocenteID as string);
    const estudiantesAlcanzados = parseInt(EstudiantesAlcanzados as string);
    const tipo = Tipo as ActividadPromocion['Tipo']; // Mantenemos el tipo

    // Mapeamos PreparatoriaID del frontend a PrepID para la DB
    const prepID = PreparatoriaID ? parseInt(PreparatoriaID as string) : null;

    // 3. VALIDACIÓN (Quitamos la obligatoriedad del Nombre y arreglamos TS)

    // Verificación de campos principales y que estudiantes > 0
    if (!docenteID || !tipo || !Fecha || isNaN(estudiantesAlcanzados) || estudiantesAlcanzados <= 0) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Docente, Tipo, Fecha, Estudiantes (> 0).' });
    }

    // FIX TS2367: Usamos 'as string' en la comparación para evitar el error de tipos literales
    const isPrepRequired = (tipo as string === 'Visitada' || tipo as string === 'Invitada' || tipo as string === 'Promoción General');
    const finalPrepID = isPrepRequired ? prepID : null;

    if (isPrepRequired && !finalPrepID) {
        return res.status(400).json({ message: `El campo PrepID (Preparatoria) es obligatorio para actividades de tipo ${tipo}.` });
    }

    // CarrerasPromovidas a cadena separada por comas (necesario para campos VARCHAR)
    const carrerasPromovidasStr = Array.isArray(CarrerasPromovidas)
        ? CarrerasPromovidas.join(',')
        : CarrerasPromovidas || '';

    const sql = `
        INSERT INTO ActividadPromocion 
            (Nombre, DocenteID, PrepID, Tipo, Fecha, EstudiantesAlcanzados, CarrerasPromovidas, Observaciones, EvidenciasURL)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        nombre, docenteID, finalPrepID, tipo, Fecha, estudiantesAlcanzados,
        carrerasPromovidasStr, Observaciones || '', EvidenciasURL
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

// ... (El resto de las funciones CRUD)

export const obtenerActividades = async (req: Request, res: Response) => { /* ... */ };
export const obtenerActividadPorId = async (req: Request, res: Response) => { /* ... */ };
export const actualizarActividad = async (req: Request, res: Response) => { /* ... */ };
export const eliminarActividad = async (req: Request, res: Response) => { /* ... */ };