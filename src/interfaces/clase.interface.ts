// src/interfaces/clase.interface.ts

// Mapea la tabla ClaseNivelacion
export interface ClaseNivelacion {
    ClaseID?: number;
    DocenteID: number; // FK a Docente
    Titulo: string;
    Status: 'Programada' | 'Completada';
    Fecha: string; // YYYY-MM-DD
    Ubicacion?: string;
}