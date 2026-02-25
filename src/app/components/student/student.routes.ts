import { Routes } from '@angular/router';
import { StudentLayout } from './layout/student-layout';

export const studentRoutes: Routes = [
    {
        path: '',
        component: StudentLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./dashboard/student-dashboard').then(m => m.StudentDashboard)
            },
            {
                path: 'solicitudes',
                loadComponent: () =>
                    import('./solicitudes/student-solicitudes').then(m => m.StudentSolicitudes)
            },
            {
                path: 'seguimiento',
                loadComponent: () =>
                    import('./seguimiento/student-seguimiento').then(m => m.StudentSeguimiento)
            },
            {
                path: 'asistente',
                loadComponent: () =>
                    import('./asistente/student-asistente').then(m => m.StudentAsistente)
            },
            {
                path: 'notificaciones',
                loadComponent: () =>
                    import('./notificaciones/student-notificaciones').then(m => m.StudentNotificaciones)
            },
        ]
    }
];
