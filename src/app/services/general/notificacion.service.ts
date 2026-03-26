import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface NotificacionDTO {
  idNotificacion: number;
  idTipo: number | null;
  idUsuario: number;
  idSolicitud: number | null;
  titulo: string;
  mensaje: string;
  canal: string;
  estaLeida: boolean;
  fechaLectura: string | null;
  estaEnviada: boolean;
  fechaEnvio: string | null;
  errorEnvio: string | null;
  programadaPara: string | null;
  fechaCreacion: string;
}

@Injectable({ providedIn: 'root' })
export class NotificacionService {
  private baseUrl = `${environment.apiUrl}/api/notificaciones`;

  constructor(private http: HttpClient) {}

  obtenerMisNotificaciones(): Observable<NotificacionDTO[]> {
    return this.http.get<NotificacionDTO[]>(`${this.baseUrl}/mis-notificaciones`);
  }

  obtenerNoLeidas(): Observable<NotificacionDTO[]> {
    return this.http.get<NotificacionDTO[]>(`${this.baseUrl}/mis-notificaciones/no-leidas`);
  }

  marcarLeida(id: number): Observable<NotificacionDTO> {
    return this.http.patch<NotificacionDTO>(`${this.baseUrl}/${id}/marcar-leida`, {});
  }

  marcarTodasLeidas(): Observable<{ mensaje: string }> {
    return this.http.patch<{ mensaje: string }>(`${this.baseUrl}/marcar-todas-leidas`, {});
  }
}
