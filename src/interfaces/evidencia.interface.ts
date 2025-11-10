// src/interfaces/evidencia.interface.ts

export interface EvidenciaCurso {
    EvidenciaID?: number;
    EstudianteID: number;
    Titulo: string;
    Fecha: string; // YYYY-MM-DD
    Status: 'Aprobado' | 'Pendiente' | 'Rechazado';
    ArchivoURL?: string;
}