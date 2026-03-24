import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AutenticacionRequest, AutenticacionRespuesta } from '../../models/general/autenticacion.model';
import { environment } from '../../../environments/environment';

const SESSION_KEY = 'sgte_user';

const ROLE_ROUTES: Record<string, string> = {
    coordinador: '/coordinacion',
    decano: '/decanato',
    estudiante: '/estudiante',
    administrador: '/administrador',
};

@Injectable({ providedIn: 'root' })
export class AutenticacionService {

    private apiUrl = environment.apiUrl + '/api/sistema/autenticacion/iniciar-sesion';

    constructor(private http: HttpClient) { }

    /** Guarda la respuesta en sessionStorage si el login fue exitoso */
    iniciarSesion(credentials: AutenticacionRequest): Observable<AutenticacionRespuesta> {
        return this.http.post<AutenticacionRespuesta>(this.apiUrl, credentials).pipe(
            tap(response => {
                if (response && response.idUsuario) {
                    sessionStorage.setItem(SESSION_KEY, JSON.stringify(response));
                }
            })
        );
    }

    /** Elimina la sesión del usuario */
    cerrarSesion(): void {
        sessionStorage.removeItem(SESSION_KEY);
    }

    /** Retorna los datos del usuario actual (o null si no está autenticado) */
    obtenerUsuarioActual(): AutenticacionRespuesta | null {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    /** Indica si el usuario está autenticado */
    estaAutenticado(): boolean {
        return this.obtenerUsuarioActual() !== null;
    }

    /** Devuelve la ruta de redirección según el rol del usuario */
    obtenerRutaPorRolUsuarioActual(rol: string): string {
        if (!rol) { return '/login'; }
        return ROLE_ROUTES[rol.toLowerCase().trim()] || '/login';
    }
}
