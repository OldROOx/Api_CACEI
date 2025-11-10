// src/interfaces/asistencia.interface.ts

// Mapea la tabla RegistroAsistencia
export interface RegistroAsistencia {
    AsistenciaID?: number;
    ClaseID: number;
    EstudianteID: number;
    Fecha: string; // Debe coincidir con la fecha de la toma de asistencia
    Status: 'Presente' | 'Ausente';
}