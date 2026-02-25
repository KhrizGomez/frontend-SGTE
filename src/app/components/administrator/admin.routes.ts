import { Routes } from '@angular/router';
import { AdminLayout } from './layout/admin-layout';

export const adminRoutes: Routes = [
    {
        path: '',
        component: AdminLayout,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./dashboard/admin-dashboard').then(m => m.AdminDashboard)
            },
            {
                path: 'usuarios',
                loadComponent: () =>
                    import('./usuarios/admin-usuarios').then(m => m.AdminUsuarios)
            },
        ]
    }
];
