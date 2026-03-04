import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StudentDashboardResponse } from '../models/student-dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class StudentService {
    private readonly apiUrl = 'http://localhost:9090/api/sistema/dashboard-estudiante';

    constructor(private http: HttpClient) { }

    getDashboardData(): Observable<StudentDashboardResponse> {
        return this.http.get<StudentDashboardResponse>(this.apiUrl);
    }
}
