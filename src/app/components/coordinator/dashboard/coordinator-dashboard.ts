import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-coordinator-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="dashboard-placeholder">
      <div class="placeholder-card">
        <i class="bi bi-diagram-3-fill placeholder-icon"></i>
        <h2>Bienvenido al Portal Coordinador</h2>
        <p>Gestiona solicitudes, docentes y estudiantes desde aquí.</p>
      </div>
    </div>
  `,
    styles: [`
    .dashboard-placeholder {
      display: flex; justify-content: center; align-items: center;
      height: 100%; min-height: 400px;
    }
    .placeholder-card {
      text-align: center; padding: 48px;
      background: white; border-radius: 20px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.07);
      max-width: 480px; width: 100%;
    }
    .placeholder-icon {
      font-size: 4rem; color: #10b981; display: block; margin-bottom: 20px;
    }
    h2 { color: #1e293b; margin-bottom: 12px; }
    p  { color: #64748b; }
  `]
})
export class CoordinatorDashboard { }
