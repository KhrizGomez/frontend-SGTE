import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-usuarios',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="padding:32px">
      <h3>Usuarios</h3>
      <p style="color:#64748b">Administración de usuarios del sistema.</p>
    </div>
  `
})
export class AdminUsuarios { }
