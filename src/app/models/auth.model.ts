export interface LoginRequest {
    nombreUsuario: string;
    contrasena: string;
}

export interface LoginResponse {
    idUsuario: number;
    nombreUsuario: string;
    nombres: string;
    apellidos: string;
    correoInstitucional: string;
    telefono: string;
    estado: boolean;
    roles: string[];
    mensaje: string;
}
