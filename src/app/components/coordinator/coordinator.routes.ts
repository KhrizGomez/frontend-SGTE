import { Routes } from '@angular/router';
import { CoordinatorLayout } from './layout/coordinator-layout';

export const coordinatorRoutes: Routes = [
    {
        path: '',
        component: CoordinatorLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./dashboard/coordinator-dashboard').then(m => m.CoordinatorDashboard) },
            { path: 'solicitudes', loadComponent: () => import('./solicitudes/coordinator-solicitudes').then(m => m.CoordinatorSolicitudes) },
            { path: 'estudiantes', loadComponent: () => import('./estudiantes/coordinator-estudiantes').then(m => m.CoordinatorEstudiantes) },
            { path: 'docentes', loadComponent: () => import('./docentes/coordinator-docentes').then(m => m.CoordinatorDocentes) },
            { path: 'reportes', loadComponent: () => import('./reportes/coordinator-reportes').then(m => m.CoordinatorReportes) },
            { path: 'asistente', loadComponent: () => import('./asistente/coordinator-asistente').then(m => m.CoordinatorAsistente) },
            { path: 'notificaciones', loadComponent: () => import('./notificaciones/coordinator-notificaciones').then(m => m.CoordinatorNotificaciones) },
            { path: 'configuracion', loadComponent: () => import('./configuracion/coordinator-configuracion').then(m => m.CoordinatorConfiguracion) },
        ]
    }
];
