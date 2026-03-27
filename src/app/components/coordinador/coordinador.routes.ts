import {Routes} from '@angular/router';
import {CoordinadorLayoutComponent} from './layout/coordinador-layout.component';
import {DashboardComponent} from './dashboard/dashboard.component';
import {PlantillasComponent} from './plantillas/plantillas.component';
import {SolicitudesComponent} from './solicitudes/solicitudes.component';
import {NotificacionesComponent} from './notificaciones/notificaciones.component';

// Enruta vistas internas del modulo de coordinacion.
export const coordinadorRoutes: Routes = [
    {
        path: '',
        component: CoordinadorLayoutComponent,
        children: [
            { path: 'dashboard', component: DashboardComponent },
            { path: 'plantillas', component: PlantillasComponent },
            { path: 'solicitudes', component: SolicitudesComponent },
            { path: 'notificaciones', component: NotificacionesComponent },

            { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
        ]
    },

];

