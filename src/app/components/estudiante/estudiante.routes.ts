import { Routes } from '@angular/router';
import { EstudianteLayoutComponent } from './layout/estudiante-layout.component';
import { EstudianteDashboard } from './dashboard/dashboard.component';
import { EstudianteSolicitudes } from './solicitudes/solicitudes.component';
import { EstudianteSeguimiento } from './seguimiento/seguimiento.component';
import { EstudianteNotificaciones } from './notificaciones/notificaciones.component';

export const estudianteRoutes: Routes = [
  {
    path: '',
    component: EstudianteLayoutComponent,
    children: [
      { path: 'dashboard', component: EstudianteDashboard },
      { path: 'solicitudes', component: EstudianteSolicitudes },
      { path: 'seguimiento', component: EstudianteSeguimiento },
      { path: 'notificaciones', component: EstudianteNotificaciones },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
