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

export interface FlujoTramite {
    idFlujo: number;
    nombreFlujo: string;
    descripcionFlujo: string;
    estaActivo: boolean;
    version: number;
    creadoPor: number | null;
}

