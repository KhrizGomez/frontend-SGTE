import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';
import { environment } from '../../environments/environment';

const SESSION_KEY = 'sgte_user';

const ROLE_ROUTES: Record<string, string> = {
    coordinador: '/coordinacion',
    decano: '/decano',
    estudiante: '/estudiante',
    administrador: '/administrador',
};

@Injectable({ providedIn: 'root' })
export class AuthService {

    private apiUrl = environment.apiUrl + '/api/sistema/autenticacion/iniciar-sesion';

    constructor(private http: HttpClient) { }

    /** Guarda la respuesta en sessionStorage si el login fue exitoso */
    login(credentials: LoginRequest): Observable<LoginResponse> {
        return this.http.post<LoginResponse>(this.apiUrl, credentials).pipe(
            tap(response => {
                if (response && response.idUsuario) {
                    sessionStorage.setItem(SESSION_KEY, JSON.stringify(response));
                }
            })
        );
    }

    /** Elimina la sesión del usuario */
    logout(): void {
        sessionStorage.removeItem(SESSION_KEY);
    }

    /** Retorna los datos del usuario actual (o null si no está autenticado) */
    getCurrentUser(): LoginResponse | null {
        const raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    /** Indica si el usuario está autenticado */
    isAuthenticated(): boolean {
        return this.getCurrentUser() !== null;
    }

    /** Devuelve la ruta de redirección según el rol del usuario */
    getRouteForRoleCurrentUser(rol: string): string {
        if (!rol) { return '/login'; }
        return ROLE_ROUTES[rol.toLowerCase().trim()] || '/login';
    }
}
