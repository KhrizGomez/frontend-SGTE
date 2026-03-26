export interface AutenticacionRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface AutenticacionRespuesta {
    idUsuario: number;
    nombres: string;
    apellidos: string;
    correoInstitucional: string;
    correoPersonal?: string;
    telefono: string;
    estado: boolean;
    idFacultad?: number;
    nombreFacultad?: string;
    idCarrera: number;
    carrera: string;
    idRol: number;
    rol: string;
    facultad?: string;
    mensaje: string;
    token: string;
}
