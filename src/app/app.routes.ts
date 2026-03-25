import { Routes } from '@angular/router';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';

export const routes: Routes = [
    { path: 'inicio-sesion', component: InicioSesionComponent },
    { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
    { path: 'coordinacion',
        loadChildren: () =>
            import('./components/coordinador/coordinador.routes').then(m => m.coordinadorRoutes) },
    { path: 'estudiante',
        loadChildren: () =>
            import('./components/estudiante/estudiante.routes').then(m => m.estudianteRoutes) },

    { path: '**', redirectTo: 'inicio-sesion' }

];
