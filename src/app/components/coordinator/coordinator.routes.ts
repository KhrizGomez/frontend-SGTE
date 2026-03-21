import {Routes} from '@angular/router';
import {Formalities} from './formalities/formalities';
import {CoordinatorLayout} from './layout/coordinator-layout';


export const coordinatorRoutes: Routes = [
    {
        path: '',
        component: CoordinatorLayout,
        children: [
            { path: 'tramites', component: Formalities}
        ]
    },

]
