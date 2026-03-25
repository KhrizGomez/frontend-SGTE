import { Routes } from '@angular/router';
import { Login } from './components/login/login';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'coordinacion',
        loadChildren: () =>
            import('./components/coordinator/coordinator.routes').then(m => m.coordinatorRoutes) },

    { path: '**', redirectTo: 'login' }

];
