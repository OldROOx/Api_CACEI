// src/interfaces/estudiante.interface.ts

// Mapea la tabla Estudiante
export interface Estudiante {
    EstudianteID?: number;
    Nombre: string;
    Correo: string; // UNIQUE
}