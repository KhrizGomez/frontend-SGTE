import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
    selector: 'app-formalities',
    imports: [
        FormsModule
    ],
    templateUrl: './formalities.html',
    styleUrl: './formalities.css',
    standalone: true
})
export class Formalities {

    categoriaTramiteSeleccion: string = '';
    seguimientoTramiteSelecccion: string = '';

    listaTramites: TramiteCard[] = [
        {
            id: 1,
            titulo: 'Homologación de materias',
            categoria: 'Homologación',
            prioridad: 'Alta',
            estado: 'Publicado',
            fechaVence: '2025-09-25'
        },
        {
            id: 2,
            titulo: 'Certificados académicos',
            categoria: 'Certificados académicos',
            prioridad: 'Media',
            estado: 'En revisión',
            fechaVence: '2025-09-20'
        },
        {
            id: 3,
            titulo: 'Cambio de carrera',
            categoria: 'Cambio de carrera',
            prioridad: 'Urgente',
            estado: 'Publicado',
            fechaVence: '2025-10-05'
        },
        {
            id: 4,
            titulo: 'Baja de matrícula parcial',
            categoria: 'Baja de matrícula',
            prioridad: 'Media',
            estado: 'Borrador',
            fechaVence: '2025-09-30'
        },
        {
            id: 3,
            titulo: 'Cambio de carrera',
            categoria: 'Cambio de carrera',
            prioridad: 'Urgente',
            estado: 'Publicado',
            fechaVence: '2025-10-05'
        },
        {
            id: 4,
            titulo: 'Baja de matrícula parcial',
            categoria: 'Baja de matrícula',
            prioridad: 'Media',
            estado: 'Borrador',
            fechaVence: '2025-09-30'
        }
    ];

    listaCategoriasTramites = [
        {
            id_categoria: 1,
            nombre_categoria: "Certificados",
            descripcion_categoria: "Solicitud de certificados académicos y administrativos",
            esta_activo: true
        }
    ];

    listaSeguimientosTramites = [
        {
            id_flujo: 1,
            nombre_flujo: "Flujo Certificado Simple",
            descripcion_flujo: "Flujo estándar para certificados que solo requieren aprobación de coordinación",
            esta_activo: true,
            version: 1,
            creado_por: null
        }
    ];
}

export interface TramiteCard {
    id: number;
    titulo: string;
    categoria: string;
    prioridad: string;
    estado: string;
    fechaVence: string;
}
