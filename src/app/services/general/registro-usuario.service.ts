import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';
import { RegistroUsuarioPayload, RegistroUsuarioRespuesta } from '../../models/general/registro-usuario.model';
import { environment } from '../../../environments/environment';
import { getCredencialesTemplate } from '../../core/templates/email-credenciales.template';

@Injectable({
  providedIn: 'root',
})
export class RegistroUsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/api/sistema/registro`;

  constructor(private http: HttpClient) {}

  registrarUsuario(userData: RegistroUsuarioPayload): Observable<RegistroUsuarioRespuesta> {
    const payload = this.normalizarPayload(userData);
    return this.http.post<RegistroUsuarioRespuesta>(this.apiUrl, payload);
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

  private normalizarPayload(userData: RegistroUsuarioPayload): RegistroUsuarioPayload {
    const normalizado: RegistroUsuarioPayload = {
      ...userData,
      cedula: userData.cedula.trim(),
      nombres: userData.nombres.trim(),
      apellidos: userData.apellidos.trim(),
    };

    // JSON.stringify omite propiedades con valor undefined.
    return JSON.parse(JSON.stringify(normalizado)) as RegistroUsuarioPayload;
  }
}
