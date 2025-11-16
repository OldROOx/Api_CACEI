export interface Asistencia {
    AsistenciaID: number;
    ClaseID: number;
    EstudianteID: number;
    Presente: boolean;
    FechaRegistro?: Date;
}