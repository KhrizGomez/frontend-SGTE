import { Routes } from '@angular/router';
import { InicioSesionComponent } from './components/inicio-sesion/inicio-sesion.component';

// Rutas raiz de la aplicacion con carga perezosa por modulo de rol.
export const routes: Routes = [
    { path: 'inicio-sesion', component: InicioSesionComponent },
    { path: '', redirectTo: 'inicio-sesion', pathMatch: 'full' },
    { path: 'coordinacion',
        loadChildren: () =>
            import('./components/coordinador/coordinador.routes').then(m => m.coordinadorRoutes) },
    { path: 'decanato',
        loadChildren: () =>
            import('./components/decano/decano.routes').then(m => m.decanoRoutes) },
    { path: 'estudiante',
        loadChildren: () =>
            import('./components/estudiante/estudiante.routes').then(m => m.estudianteRoutes) },

    { path: '**', redirectTo: 'inicio-sesion' }

];
