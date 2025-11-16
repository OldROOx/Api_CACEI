import { Request, Response } from 'express';
import { query } from '../database';
import { Estudiante } from '../interfaces/estudiante.interface';
import * as XLSX from 'xlsx';

const isErrorWithMessage = (e: unknown): e is { message: string } => {
    return (
        typeof e === 'object' &&
        e !== null &&
        'message' in e &&
        typeof (e as { message: string }).message === 'string'
    );
};

// ==========================================================
// C R E A T E - Registro Manual
// ==========================================================

export const registrarEstudiante = async (req: Request, res: Response) => {
    const { Nombre, Apellidos, Matricula, Correo, Telefono, PrepID, CarreraInteres, Municipio, EsAceptado, Notas } = req.body;

    if (!Nombre || !Apellidos || !Correo) {
        return res.status(400).json({ message: 'Faltan campos obligatorios: Nombre, Apellidos y Correo.' });
    }

    const sql = `
        INSERT INTO Estudiante (Nombre, Apellidos, Matricula, Correo, Telefono, PrepID, CarreraInteres, Municipio, EsAceptado, Notas)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [Nombre, Apellidos, Matricula, Correo, Telefono, PrepID || null, CarreraInteres, Municipio, EsAceptado || false, Notas];

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
// C R E A T E - Carga Masiva desde Excel
// ==========================================================

export const cargarEstudiantesMasivo = async (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No se proporcionó un archivo Excel.' });
    }

    try {
        // Leer el archivo Excel
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convertir a JSON
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'El archivo Excel está vacío o no tiene el formato correcto.' });
        }

        // Validar estructura de datos
        const requiredColumns = ['Nombre', 'Apellidos', 'Correo'];
        const firstRow = data[0] as any;
        const missingColumns = requiredColumns.filter(col => !(col in firstRow));

        if (missingColumns.length > 0) {
            return res.status(400).json({
                message: `Faltan columnas obligatorias: ${missingColumns.join(', ')}`,
                ejemplo: 'Asegúrese de que el Excel tenga las columnas: Nombre, Apellidos, Correo, Matricula, Telefono, Preparatoria, CarreraInteres, Municipio'
            });
        }

        // Obtener preparatorias para mapear nombres a IDs
        const preparatorias = await query('SELECT PrepID, Nombre FROM Preparatoria') as any[];
        const prepMap = preparatorias.reduce((acc: any, prep: any) => {
            acc[prep.Nombre.toLowerCase()] = prep.PrepID;
            return acc;
        }, {});

        let insertados = 0;
        let errores = 0;
        const erroresDetalle: string[] = [];

        // Insertar cada estudiante
        for (let i = 0; i < data.length; i++) {
            const row = data[i] as any;

            try {
                // Mapear PrepID desde nombre de preparatoria
                let prepID = null;
                if (row.Preparatoria) {
                    prepID = prepMap[row.Preparatoria.toLowerCase()] || null;
                }

                const sql = `
                    INSERT INTO Estudiante (Nombre, Apellidos, Matricula, Correo, Telefono, PrepID, CarreraInteres, Municipio, EsAceptado, Notas)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                const values = [
                    row.Nombre,
                    row.Apellidos,
                    row.Matricula || null,
                    row.Correo,
                    row.Telefono || null,
                    prepID,
                    row.CarreraInteres || null,
                    row.Municipio || null,
                    row.EsAceptado === 'SI' || row.EsAceptado === 'Sí' || row.EsAceptado === true,
                    row.Notas || null
                ];

                await query(sql, values);
                insertados++;
            } catch (error) {
                errores++;
                erroresDetalle.push(`Fila ${i + 2}: ${row.Nombre} ${row.Apellidos} - ${isErrorWithMessage(error) ? error.message : 'Error desconocido'}`);
            }
        }

        res.status(201).json({
            message: `Carga masiva completada. ${insertados} estudiantes insertados, ${errores} errores.`,
            insertados,
            errores,
            erroresDetalle: erroresDetalle.slice(0, 10) // Máximo 10 errores en respuesta
        });

    } catch (error) {
        console.error('Error procesando archivo Excel:', error);
        res.status(500).json({
            message: 'Error procesando el archivo Excel.',
            details: isErrorWithMessage(error) ? error.message : 'Error desconocido'
        });
    }
};

// ==========================================================
// R E A D
// ==========================================================

export const obtenerEstudiantes = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT 
                E.*,
                P.Nombre AS PreparatoriaNombre
            FROM Estudiante E
            LEFT JOIN Preparatoria P ON E.PrepID = P.PrepID
            ORDER BY E.Nombre ASC
        `;
        const estudiantes = await query(sql);
        res.status(200).json(estudiantes);
    } catch (error) {
        let errorMessage = 'Error al obtener la lista de estudiantes.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

export const obtenerEstudiantePorId = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const sql = 'SELECT * FROM Estudiante WHERE EstudianteID = ?';
        const estudiante = await query(sql, [id]);
        if (estudiante.length === 0) {
            return res.status(404).json({ message: 'Estudiante no encontrado.' });
        }
        res.status(200).json(estudiante[0]);
    } catch (error) {
        let errorMessage = 'Error al obtener el estudiante.';
        if (isErrorWithMessage(error)) {
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};

// Endpoint para obtener estadísticas por municipio/preparatoria
export const obtenerEstadisticasEstudiantes = async (req: Request, res: Response) => {
    try {
        const porMunicipio = await query(`
            SELECT Municipio, COUNT(*) as cantidad 
            FROM Estudiante 
            WHERE Municipio IS NOT NULL AND Municipio != ''
            GROUP BY Municipio
        `);

        const porPreparatoria = await query(`
            SELECT P.Nombre as preparatoria, COUNT(E.EstudianteID) as cantidad
            FROM Estudiante E
            JOIN Preparatoria P ON E.PrepID = P.PrepID
            GROUP BY P.Nombre
        `);

        res.status(200).json({
            porMunicipio,
            porPreparatoria
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener estadísticas.' });
    }
};

// ==========================================================
// U P D A T E
// ==========================================================

export const actualizarEstudiante = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { Nombre, Apellidos, Matricula, Correo, Telefono, PrepID, CarreraInteres, Municipio, EsAceptado, Notas } = req.body;

    if (!Nombre || !Apellidos || !Correo) {
        return res.status(400).json({ message: 'Faltan campos obligatorios para actualizar el estudiante.' });
    }

    const sql = `
        UPDATE Estudiante 
        SET Nombre = ?, Apellidos = ?, Matricula = ?, Correo = ?, Telefono = ?, PrepID = ?, CarreraInteres = ?, Municipio = ?, EsAceptado = ?, Notas = ?
        WHERE EstudianteID = ?
    `;
    const values = [Nombre, Apellidos, Matricula, Correo, Telefono, PrepID || null, CarreraInteres, Municipio, EsAceptado, Notas, id];

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
            errorMessage = error.message;
        }
        res.status(500).json({ message: errorMessage });
    }
};