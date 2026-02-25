import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserRegistrationService {
  private apiUrl = 'http://localhost:9090/api/sistema/registro';

  constructor(private http: HttpClient) {}

  registrarUsuario(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}
