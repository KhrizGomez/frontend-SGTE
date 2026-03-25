import {Routes} from '@angular/router';
import {DecanoLayoutComponent} from './layout/decano-layout.component';
import {Dashboard} from './dashboard/dashboard';
import {Plantillas} from './plantillas/plantillas';
import {Solicitudes} from './solicitudes/solicitudes';
import {Notificaciones} from './notificaciones/notificaciones';

export const decanoRoutes: Routes = [
    {
        path: '',
        component: DecanoLayoutComponent,
        children: [
            { path: 'dashboard', component: Dashboard },
            { path: 'plantillas', component: Plantillas },
            { path: 'solicitudes', component: Solicitudes },
            { path: 'notificaciones', component: Notificaciones },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

];



