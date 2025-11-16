export interface EvidenciaActividad {
    EvidenciaID?: number;
    ActividadID: number;
    TipoEvidencia: 'Foto' | 'Video' | 'Documento' | 'Enlace';
    URL: string;
    Descripcion?: string;
    FechaSubida?: Date;
}