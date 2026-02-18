import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserValidationService {
  private apiUrl = 'http://localhost:8080/api/validation/user';

  constructor(private http: HttpClient) { }

  validarUsuario(cedula: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${cedula}`);
  }
}

