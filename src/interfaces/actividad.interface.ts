// src/interfaces/actividad.interface.ts

// Mapea la tabla ActividadPromocion
export interface ActividadPromocion {
    ActividadID?: number;

    // Claves foráneas
    DocenteID: number;
    PrepID: number | null; // Opcional si el tipo es 'Digital'

    // Campos de la tabla
    Tipo: 'Visitada' | 'Invitada' | 'Digital';
    Fecha: string; // Se recomienda recibir la fecha como string (YYYY-MM-DD)
    EstudiantesAlcanzados: number;
    CarrerasPromovidas: string; // Tipo TEXT en DB
    Observaciones: string; // Tipo TEXT en DB
    EvidenciasURL?: string; // Ruta a Imagen/PDF/Excel

    // Campos adicionales del formulario que no se guardan directamente en la tabla
    Duracion?: string;
}