import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-coordinator-solicitudes',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding:32px">
      <h3>Solicitudes</h3>
      <p style="color:#64748b">Gestión de solicitudes de refuerzo académico.</p>
    </div>
  `
})
export class CoordinatorSolicitudes { }
