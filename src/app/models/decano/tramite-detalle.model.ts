export interface PasoTramite {
    idPaso: number;
    idFlujo: number;
    ordenPaso: number;
    idEtapa: number;
    codigoEtapa: string;
    nombreEtapa: string;
    descripcionEtapa: string;
    idRolRequerido: number | null;
    rolRequerido: string | null;
    idUsuarioEncargado: number | null;
    usuarioEncargado: string | null;
    horasSla: number;
}

export interface RequisitoTramite {
    idRequisito: number;
    idTipoTramite: number;
    nombreRequisito: string;
    descripcionRequisito: string;
    esObligatorio: boolean;
    tipoDocumento: string;
    tamanoMaxMb: number;
    extensionesPermitidas: string;
    numeroOrden: number;
}

export interface TipoTramiteDetalle {
    idTipoTramite: number;
    nombreTramite: string;
    descripcionTramite: string;
    idCategoria: number;
    categoria: string;
    idFlujo: number;
    nombreFlujo: string;
    descripcionFlujo: string;
    idUsuarioCreador: number | null;
    usuarioCreador: string;
    version: number;
    pasosTramite: PasoTramite[];
    requisitosTramite: RequisitoTramite[];
    idPlazo: number;
    fechaApertura: string;
    fechaCierre: string;
    permiteExtension: boolean;
    diasEstimados: number;
    estaActivo: boolean;
    disponibleExternos: boolean;
    pasos: number | null;
}

export interface RegistrarTipoTramitePayload {
    nombreTramite: string;
    descripcionTramite: string;
    idCategoria: number | null;
    idFlujo: number | null;
    fechaApertura: string;
    fechaCierre: string;
    permiteExtension: boolean;
    diasEstimados: number;
    estaActivo: boolean;
    disponibleExternos: boolean;
}

export interface GuardarPlantillaPayload {
    nombrePlantilla: string;
    descripcionPlantilla: string;
    idCategoria: number | null;
    idCarrera: number;
    idFlujo: number | null;
    diasEstimados: number;
    estaActivo: boolean;
    disponibleExternos: boolean;
    requisitos: RequisitoNuevoPlantilla[];
}

export interface RequisitoNuevoPlantilla {
    nombreRequisito: string;
    descripcionRequisito: string;
    esObligatorio: boolean;
    tipoDocumento: string;
    tamanoMaxMb: number;
    extensionesPermitidas: string;
    numeroOrden: number;
}

export interface EtapaFlujoCompletoRequest {
    idEtapa?: number | null;
    nombreEtapa?: string;
    descripcionEtapa?: string;
    codigoEtapa?: string;
}

export interface PasoFlujoCompletoRequest {
    idEtapa?: number | null;
    etapa?: EtapaFlujoCompletoRequest;
    ordenPaso: number;
    rolRequeridoId: number | null;
    idUsuarioEncargado: number | null;
    horasSla: number;
}

export interface GuardarFlujoCompletoPayload {
    nombreFlujo: string;
    descripcionFlujo: string;
    estaActivo: boolean;
    version: number;
    creadoPorId: number;
    pasos: PasoFlujoCompletoRequest[];
}

export interface GuardarFlujoCompletoResponse {
    idFlujo: number;
    nombreFlujo: string;
    descripcionFlujo: string;
    estaActivo: boolean;
    version: number;
    creadoPorId: number | null;
}

export interface PasoNuevoPlantilla {
    idPaso: number;
    ordenPaso: number;
    idEtapa: number | null;
    codigoEtapa: string;
    nombreEtapa: string;
    descripcionEtapa: string;
    idRolRequerido: number | null;
    rolRequerido: string;
    idUsuarioEncargado: number | null;
    usuarioEncargado: string;
    horasSla: number;
}

export interface NuevaPlantillaForm {
    nombrePlantilla: string;
    idCategoria: number | null;
    categoria: string;
    flujoSeleccionadoId: number | null;
    descripcionPlantilla: string;
    diasResolucionEstimados: number | null;
    disponibleExternos: boolean;
    estaActivo: boolean;
    pasos: PasoNuevoPlantilla[];
    requisitos: RequisitoNuevoPlantilla[];
}

export interface PlantillaCarrera {
    idPlantilla: number;
    nombrePlantilla: string;
    descripcionPlantilla: string;
    idCategoria: number;
    categoria: string;
    idCarrera: number;
    carrera: string;
    idFlujo: number;
    nombreFlujo: string;
    descripcion: string;
    idUsuarioCreador: number | null;
    usuarioCreador: string;
    version: number;
    pasosTramite: PasoTramite[];
    requisitosTramite: RequisitoTramite[];
    idVentana: number | null;
    fechaApertura: string | null;
    fechaCierre: string | null;
    permiteExtension: boolean | null;
    diasResolucionEstimados: number;
    estaActivo: boolean;
    disponibleExternos: boolean;
    pasos: number | null;
}

export interface CategoriaTramite {
    idCategoria: number;
    nombreCategoria: string;
    descripcionCategoria: string;
    estaActivo: boolean;
}

export interface EtapaTramite {
    idEtapa: number;
    nombreEtapa: string;
    descripcionEtapa: string;
    codigoEtapa: string;
}

export interface UsuarioAsignableTramite {
    idUsuario: number;
    nombres: string;
    apellidos: string;
    idRol: number | null;
    rol: string;
    idFacultad: number | null;
    facultad: string;
    idCarrera: number | null;
    carrera: string;
}

export interface FlujoTramite {
    idFlujo: number;
    nombreFlujo: string;
    descripcionFlujo: string;
    categoria?: string;
    estaActivo: boolean;
    version: number;
    creadoPor: number | null;
    pasos: PasoTramite[];
}

export interface SolicitudDetalleResponse {
    idSolicitud: number;
    codigoSolicitud: string;
    nombrePlantilla: string;
    categoria: string;
    carrera: string;
    nombreUsuario: string | null;
    prioridad: string;
    estadoActual: string;
    detallesSolicitud: string;
    resolucion: string | null;
    fechaCreacion: string;
    fechaEstimadaFin: string | null;
    fechaRealFin: string | null;
    etapaActual: number;
    totalEtapas: number;
    idPasoActual: number | null;
    pasosFlujo: PasoFlujoItem[];
    historial: HistorialItem[];
    documentos: DocumentoItem[];
}

export interface PasoFlujoItem {
    idPaso: number;
    ordenPaso: number;
    nombreEtapa: string | null;
    codigoEtapa: string | null;
    descripcionEtapa: string | null;
    rolRequerido: string | null;
    idRolRequerido: number | null;
    usuarioEncargado: string | null;
    horasSla: number;
}

export interface AccionPasoRequest {
    idSolicitud: number;
    comentarios?: string;
    idMotivo?: number;
}

export interface HistorialItem {
    idHistorial: number;
    nombreEtapa: string | null;
    codigoEtapa: string | null;
    estado: string;
    tipoAccion: string | null;
    procesadoPor: string | null;
    comentarios: string | null;
    fechaEntrada: string | null;
    fechaCompletado: string | null;
    slaExcedido: boolean;
    ordenPaso: number | null;
}

export interface DocumentoItem {
    idDocumento: number;
    nombreOriginal: string;
    nombreArchivo: string;
    rutaArchivo: string;
    tamanoBytes: number;
    tipoMime: string | null;
    esValido: boolean | null;
    fechaSubida: string | null;
    nombreRequisito: string | null;
}

