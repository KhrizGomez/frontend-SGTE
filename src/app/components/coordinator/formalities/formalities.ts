import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import {
    CategoriaTramite,
    FlujoTramite,
    RegistrarTipoTramitePayload,
    TipoTramiteDetalle,
} from '../../../models/tramite-detalle.model';
import { FormalitiesService } from '../../../services/formalities.service';

@Component({
    selector: 'app-formalities',
    imports: [
        FormsModule
    ],
    templateUrl: './formalities.html',
    styleUrl: './formalities.css',
    standalone: true
})
export class Formalities implements OnInit {
    readonly listaTramites: TipoTramiteDetalle[] = [];

    listaCategoriasTramites: CategoriaTramite[] = [
        {
            idCategoria: 1,
            nombreCategoria: 'Certificados',
            descripcionCategoria: 'Solicitud de certificados académicos y administrativos',
            estaActivo: true,
        },
    ];

    listaSeguimientosTramites: FlujoTramite[] = [
        {
            idFlujo: 1,
            nombreFlujo: 'Flujo Certificado Simple',
            descripcionFlujo:
                'Flujo estandar para certificados que solo requieren aprobacion de coordinacion',
            estaActivo: true,
            version: 1,
            creadoPor: null,
        },
    ];

    formularioRegistro: RegistrarTipoTramitePayload = this.crearFormularioVacio();
    modalModo: 'registro' | 'detalle' = 'registro';
    tramiteSeleccionado: TipoTramiteDetalle | null = null;

    estaCargando = false;
    guardando = false;
    errorCarga = '';
    errorGuardado = '';
    mensajeGuardado = '';

    constructor(private readonly formalitiesService: FormalitiesService) {}

    ngOnInit(): void {
        this.cargarTramites();
    }

    abrirModalRegistro(): void {
        this.modalModo = 'registro';
        this.tramiteSeleccionado = null;
        this.errorGuardado = '';
        this.mensajeGuardado = '';
        this.formularioRegistro = this.crearFormularioVacio();
    }

    abrirModalDetalle(tramite: TipoTramiteDetalle): void {
        this.modalModo = 'detalle';
        this.tramiteSeleccionado = tramite;
        this.errorGuardado = '';
    }

    guardarTramite(): void {
        this.errorGuardado = '';
        this.mensajeGuardado = '';

        if (!this.formularioRegistro.nombreTramite.trim()) {
            this.errorGuardado = 'El nombre del tramite es obligatorio.';
            return;
        }

        if (!this.formularioRegistro.idCategoria || !this.formularioRegistro.idFlujo) {
            this.errorGuardado = 'Seleccione una categoria y un flujo para registrar el tramite.';
            return;
        }

        this.guardando = true;
        this.formalitiesService
            .registrarTipoTramite(this.formularioRegistro)
            .pipe(finalize(() => (this.guardando = false)))
            .subscribe({
                next: (tramiteCreado) => {
                    this.listaTramites.unshift(tramiteCreado);
                    this.tramiteSeleccionado = tramiteCreado;
                    this.modalModo = 'detalle';
                    this.mensajeGuardado = 'Tramite guardado correctamente.';
                    this.actualizarCatalogosDesdeTramites();
                },
                error: () => {
                    this.errorGuardado =
                        'No se pudo guardar el tramite. Verifique el endpoint de registro.';
                },
            });
    }

    private cargarTramites(): void {
        this.estaCargando = true;
        this.errorCarga = '';

        this.formalitiesService
            .getTiposTramiteDetalles()
            .pipe(finalize(() => (this.estaCargando = false)))
            .subscribe({
                next: (tramites) => {
                    this.listaTramites.splice(0, this.listaTramites.length, ...tramites);
                    this.actualizarCatalogosDesdeTramites();
                },
                error: () => {
                    this.errorCarga =
                        'No se pudieron cargar los tramites desde el endpoint configurado.';
                },
            });
    }

    private actualizarCatalogosDesdeTramites(): void {
        const categorias = new Map<number, CategoriaTramite>();
        const flujos = new Map<number, FlujoTramite>();

        for (const tramite of this.listaTramites) {
            if (tramite.idCategoria > 0 && tramite.categoria.trim()) {
                categorias.set(tramite.idCategoria, {
                    idCategoria: tramite.idCategoria,
                    nombreCategoria: tramite.categoria,
                    descripcionCategoria: '',
                    estaActivo: true,
                });
            }

            if (tramite.idFlujo > 0 && tramite.nombreFlujo.trim()) {
                flujos.set(tramite.idFlujo, {
                    idFlujo: tramite.idFlujo,
                    nombreFlujo: tramite.nombreFlujo,
                    descripcionFlujo: tramite.descripcionFlujo,
                    estaActivo: true,
                    version: tramite.version,
                    creadoPor: tramite.idUsuarioCreador,
                });
            }
        }

        if (categorias.size > 0) {
            this.listaCategoriasTramites = Array.from(categorias.values());
        }

        if (flujos.size > 0) {
            this.listaSeguimientosTramites = Array.from(flujos.values());
        }
    }

    private crearFormularioVacio(): RegistrarTipoTramitePayload {
        return {
            nombreTramite: '',
            descripcionTramite: '',
            idCategoria: null,
            idFlujo: null,
            fechaApertura: '',
            fechaCierre: '',
            permiteExtension: false,
            diasEstimados: 0,
            estaActivo: true,
            disponibleExternos: false,
        };
    }
}
