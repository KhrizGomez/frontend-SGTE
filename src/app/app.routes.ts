import { Routes } from '@angular/router';
import { Login } from './components/login/login';

export const routes: Routes = [
    { path: 'login', component: Login },

    {
        path: 'estudiante',
        loadChildren: () =>
            import('./components/student/student.routes').then(m => m.studentRoutes)
    },
    {
        path: 'coordinador',
        loadChildren: () =>
            import('./components/coordinator/coordinator.routes').then(m => m.coordinatorRoutes)
    },
    {
        path: 'decano',
        loadChildren: () =>
            import('./components/dean/dean.routes').then(m => m.deanRoutes)
    },
    {
        path: 'administrador',
        loadChildren: () =>
            import('./components/administrator/admin.routes').then(m => m.adminRoutes)
    },

    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
