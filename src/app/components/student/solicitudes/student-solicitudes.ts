import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-student-solicitudes',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding:32px">
      <h3>Mis Solicitudes</h3>
      <p style="color:#64748b">Aquí aparecerán tus solicitudes de refuerzo académico.</p>
    </div>
  `
})
export class StudentSolicitudes { }
