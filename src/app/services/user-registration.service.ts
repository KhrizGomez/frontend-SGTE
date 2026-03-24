import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegisterUserPayload, RegisterUserResponse } from '../models/user-registration.model';
import { environment } from '../../environments/environment';
import { getCredencialesTemplate } from '../core/templates/email-credenciales.template';

@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  private readonly apiUrl = `${environment.apiUrl}/api/sistema/registro`;

  constructor(private http: HttpClient) {}

  registrarUsuario(userData: RegisterUserPayload): Observable<RegisterUserResponse> {
    const payload = this.normalizarPayload(userData);
    return this.http.post<RegisterUserResponse>(this.apiUrl, payload);
  }

  enviarCorreoCredenciales(destinatario: string, username: string, contrasena: string): Observable<any> {
    const url = `${environment.apiUrl}/api/externos/correo/enviar`;
    const payload = {
      destinatario: destinatario,
      asunto: 'Credenciales de Acceso - SGTE UTEQ',
      mensaje: getCredencialesTemplate(username,contrasena)
    };
    return this.http.post(url, payload, {responseType: 'text'});
  }

  private normalizarPayload(userData: RegisterUserPayload): RegisterUserPayload {
    const normalizado: RegisterUserPayload = {
      ...userData,
      cedula: userData.cedula.trim(),
      nombres: userData.nombres.trim(),
      apellidos: userData.apellidos.trim(),
    };

    // JSON.stringify omite propiedades con valor undefined.
    return JSON.parse(JSON.stringify(normalizado)) as RegisterUserPayload;
  }
}
