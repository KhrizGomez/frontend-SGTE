import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PreferenciasCanales {
  whatsapp: boolean;
  correo: boolean;
}

export interface ConfiguracionUsuarioResponse {
  idConfiguracion: number | null;
  idUsuario: number;
  notificarEmail: boolean;
  notificarWhatsapp: boolean;
  notificarSms: boolean;
  notificarPush: boolean;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionUsuarioService {
  private baseUrl = `${environment.apiUrl}/api/configuracion-usuario`;

  constructor(private http: HttpClient) {}

  obtenerMisPreferencias(): Observable<ConfiguracionUsuarioResponse> {
    return this.http.get<ConfiguracionUsuarioResponse>(`${this.baseUrl}/mis-preferencias`);
  }

  guardarCanales(canales: PreferenciasCanales): Observable<{ mensaje: string }> {
    return this.http.put<{ mensaje: string }>(`${this.baseUrl}/canales`, canales);
  }
}
