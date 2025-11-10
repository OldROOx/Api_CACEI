export interface Docente {
    DocenteID?: number;
    Nombre: string;
    Apellidos: string;
    Correo: string;
    Especialidad: string;
    Departamento: string;
    // Campos extra del formulario que podrías necesitar si la tabla Docente se extiende:
    Telefono?: string;
    CedulaProfesional?: string;
    AniosExperiencia?: number;
    NotasAdicionales?: string;
}