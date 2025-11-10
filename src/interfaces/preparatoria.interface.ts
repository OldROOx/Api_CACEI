// src/interfaces/preparatoria.interface.ts

export interface Preparatoria {
    PrepID?: number;
    Nombre: string;
    Clave?: string;
    Tipo: 'General' | 'Técnico' | 'Telebachillerato'; // Mapeando las opciones del formulario
    Ciudad: string;
    Estado: string;
    Director?: string;
    // Campos extra del formulario que podríamos usar en un campo TEXT de la DB
    Telefono?: string;
    CorreoElectronico?: string;
    CoordinadorVinculacion?: string;
    NotasAdicionales?: string;
}