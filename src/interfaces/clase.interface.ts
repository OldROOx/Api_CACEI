export interface Clase {
    ClaseID: number;
    DocenteID: number;
    Materia: string;
    Fecha: Date;
    Horario: string;
    Tema?: string;
    Salon?: string;
    Observaciones?: string;
}