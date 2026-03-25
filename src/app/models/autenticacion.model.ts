export interface AutenticacionRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface AutenticacionRespuesta {
    idUsuario: number;
    nombres: string;
    apellidos: string;
    correoInstitucional: string;
    telefono: string;
    estado: boolean;
    idCarrera: number;
    carrera: string;
    idRol: number;
    rol: string;
    mensaje: string;
}
