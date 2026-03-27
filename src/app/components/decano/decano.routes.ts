import {Routes} from '@angular/router';
import {DecanoLayoutComponent} from './layout/decano-layout.component';
import {DecanoDashboardComponent} from './dashboard/dashboard.component';
import {DecanoPlantillasComponent} from './plantillas/plantillas.component';
import {DecanoSolicitudesComponent} from './solicitudes/solicitudes.component';
import {DecanoNotificacionesComponent} from './notificaciones/notificaciones.component';

export const decanoRoutes: Routes = [
    {
        path: '',
        component: DecanoLayoutComponent,
        children: [
            { path: 'dashboard', component: DecanoDashboardComponent },
            { path: 'plantillas', component: DecanoPlantillasComponent },
            { path: 'solicitudes', component: DecanoSolicitudesComponent },
            { path: 'notificaciones', component: DecanoNotificacionesComponent },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

];
