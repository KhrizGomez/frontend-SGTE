export interface RegisterUserPayload {
    cedula: string;
    nombres: string;
    apellidos: string;
    correoPersonal?: string;
    correoInstitucional?: string;
    telefono?: string;
    fechaNacimiento?: string;
    genero?: string;
    direccion?: string;
    rol?: string;
    estadoUsuario?: boolean;
    idFacultad?: number;
    nombreFacultad?: string;
    codigoFacultad?: string;
    ubicacionOficinaFacultad?: string;
    emailFacultad?: string;
    idCarrera?: number;
    nombreCarrera?: string;
    codigoCarrera?: string;
    duracionSemestres?: number;
    modalidad?: string;
    tituloOtorga?: string | null;
    idEstudiante?: number;
    numeroMatricula?: string;
    paralelo?: string;
    jornada?: string;
    fechaIngreso?: string;
    fechaEgreso?: string | null;
    estadoAcademico?: string;
    promedioGeneral?: number;
    creditosAprobados?: number;
    creditosTotales?: number | null;
    matriculado?: boolean;
    esBecado?: boolean;
    tipoBeca?: string | null;
    idSemestre?: number;
    codigoPeriodo?: string;
    nombrePeriodo?: string;
    fechaInicioPeriodo?: string;
    fechaFinPeriodo?: string;
    esPeriodoActual?: boolean;
    idCoordinador?: number;
    horarioAtencion?: string;
    oficinaAtencion?: string;
    fechaNombramientoCoordinador?: string;
    fechaFinPeriodoCoordinador?: string;
    resolucionNombramiento?: string;
    idDecano?: number;
    fechaNombramientoDecano?: string;
    fechaFinPeriodoDecano?: string;
    extensionTelefonica?: string;
}

export interface RegisterUserResponse {
    idUsuario?: number;
    nombreUsuario?: string;
    mensaje?: string;
}

