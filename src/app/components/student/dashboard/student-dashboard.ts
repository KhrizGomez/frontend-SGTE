import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StudentService } from '../../../services/student.service';
import { StudentDashboardResponse } from '../../../models/student-dashboard.model';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './student-dashboard.html',
  styleUrls: ['./student-dashboard.css']
})
export class StudentDashboard implements OnInit {
  dashboardData: StudentDashboardResponse | null = null;
  loading = true;
  error = false;

  constructor(private studentService: StudentService) { }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.studentService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos del dashboard:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  getStatusClass(status: string): string {
    if (!status) return 'status-pending';
    const s = status.toLowerCase();
    if (s.includes('pendiente')) return 'status-pending';
    if (s.includes('aprobado') || s.includes('finalizado')) return 'status-approved';
    if (s.includes('rechazado')) return 'status-rejected';
    return 'status-pending';
  }
}
