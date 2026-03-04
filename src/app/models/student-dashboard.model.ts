export interface RequestSummaryDTO {
    idSolicitud: number;
    codigoSolicitud: string;
    estadoActual: string;
    prioridad: string;
    fechaEstimadaFin: string;
    // Puede contener otros campos de SolicitudDTO si es necesario
}

export interface NotificationDTO {
    idNotificacion: number;
    titulo: string;
    mensaje: string;
    estaLeida: boolean;
    // Otros campos si existen
}

export interface StudentDashboardResponse {
    nombreEstudiante: string;
    solicitudesActivas: number;
    horasAcumuladas: number;
    solicitudesRecientes: RequestSummaryDTO[];
    notificaciones: NotificationDTO[];
}
