// src/interfaces/calificacion.interface.ts

export interface CalificacionInduccion {
    CalificacionID?: number;
    EstudianteID: number;
    Titulo: string;
    PuntuacionTotal: number; // DECIMAL(5, 2)
    FechaRegistro: string; // YYYY-MM-DD
    ArchivoFuente?: string;
}