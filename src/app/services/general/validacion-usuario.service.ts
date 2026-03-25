import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ValidacionUsuarioService {
  private readonly apiUrl = `${environment.validationApiUrl}/api/validation/usuario`;

  constructor(private http: HttpClient) { }

  validarUsuario(cedula: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${cedula}`);
  }
}

