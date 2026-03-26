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
}

export interface PasoNuevoPlantilla {
    idPaso: number;
    ordenPaso: number;
    idEtapa: number | null;
    codigoEtapa: string;
    nombreEtapa: string;
    descripcionEtapa: string;
    rolRequerido: string;
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
    categoria?: string;
    estaActivo: boolean;
    version: number;
    creadoPor: number | null;
    pasos: PasoTramite[];
}
