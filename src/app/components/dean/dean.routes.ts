import { Routes } from '@angular/router';
import { DeanLayout } from './layout/dean-layout';

export const deanRoutes: Routes = [
    {
        path: '',
        component: DeanLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./dashboard/dean-dashboard').then(m => m.DeanDashboard) },
            { path: 'solicitudes', loadComponent: () => import('./solicitudes/dean-solicitudes').then(m => m.DeanSolicitudes) },
            { path: 'coordinadores', loadComponent: () => import('./coordinadores/dean-coordinadores').then(m => m.DeanCoordinadores) },
            { path: 'estadisticas', loadComponent: () => import('./estadisticas/dean-estadisticas').then(m => m.DeanEstadisticas) },
            { path: 'reportes', loadComponent: () => import('./reportes/dean-reportes').then(m => m.DeanReportes) },
            { path: 'notificaciones', loadComponent: () => import('./notificaciones/dean-notificaciones').then(m => m.DeanNotificaciones) },
            { path: 'configuracion', loadComponent: () => import('./configuracion/dean-configuracion').then(m => m.DeanConfiguracion) },
        ]
    }
];
