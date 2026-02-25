import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse } from '../models/auth.model';

/** Clave usada en sessionStorage para guardar los datos del usuario autenticado */
const SESSION_KEY = 'sgte_user';

/** Mapa de rol (backend) → ruta Angular */
const ROLE_ROUTES: Record<string, string> = {
    estudiante: '/estudiante/dashboard',
    coordinador: '/coordinador/dashboard',
    decano: '/decano/dashboard',
    administrador: '/administrador/dashboard',
};

@Injectable({ providedIn: 'root' })
export class AuthService {

    private readonly apiUrl = 'http://localhost:9090/api/sistema/auth/login';

    constructor(private http: HttpClient) { }

    /**
     * Llama al endpoint POST /api/sistema/auth/login.
     * Guarda la respuesta en sessionStorage si el login fue exitoso.
     */
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

    /**
     * Devuelve la ruta de redirección según el primer rol del usuario.
     * Si el rol no está mapeado, redirige a /login.
     */
    getRouteForRole(roles: string[]): string {
        if (!roles || roles.length === 0) return '/login';
        const role = roles[0].toLowerCase();
        return ROLE_ROUTES[role] ?? '/login';
    }
}
