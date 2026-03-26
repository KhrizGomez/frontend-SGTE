import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/general/autenticacion.service';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { ToastService } from '../../../services/general/toast.service';
import { CrearSolicitudRequestDTO, PlantillaCarrera, RequisitoTramite } from '../../../models/coordinador/plantilla.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-estudiante-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css'],
})
export class EstudianteSolicitudes implements OnInit {

  plantillas: PlantillaCarrera[] = [];
  cargando = false;
  error = '';

  buscar = '';
  filtrCategoria = '';
  
  paginaActual = 1;
  porPagina = 8;

  modalAbierto = false;
  plantillaSeleccionada: PlantillaCarrera | null = null;
  observaciones = '';
  prioridadSolicitud = 'Normal';
  enviandoSolicitud = false;
  documentosRequisito: Record<number, File | null> = {};
  documentosRequisitoNombres: Record<number, string> = {};

  constructor(
    private tramitesService: TramitesService,
    private authService: AutenticacionService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPlantillasDisponibles();
  }

  cargarPlantillasDisponibles(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario?.idCarrera) {
      this.error = 'No se pudo obtener la carrera del usuario.';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    const peticion$ = this.tramitesService.getPlantillasPorCarrera(usuario.idCarrera);

    this.loadingService.withMinDuration(peticion$).subscribe({
      next: (data) => {
        // Un estudiante sÃ³lo deberÃ­a ver las plantillas activas que puede solicitar
        this.plantillas = data.filter(p => p.estaActivo);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los trÃ¡mites disponibles. Intente nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get plantillasFiltradas(): PlantillaCarrera[] {
    const q = this.buscar.trim().toLowerCase();
    return this.plantillas.filter(p => {
      const textoOk = !q || p.nombrePlantilla.toLowerCase().includes(q) ||
                      p.categoria.toLowerCase().includes(q) ||
                      p.nombreFlujo.toLowerCase().includes(q);
      const catOk = !this.filtrCategoria || p.categoria === this.filtrCategoria;
      return textoOk && catOk;
    });
  }

  get categorias(): string[] {
    return [...new Set(this.plantillas.map(p => p.categoria))];
  }

  get totalDisponibles(): number {
    return this.plantillas.length;
  }

  get maxPagina(): number {
    return Math.ceil(this.plantillasFiltradas.length / this.porPagina) || 1;
  }

  get plantillasPaginadas(): PlantillaCarrera[] {
    const actual = Math.min(this.paginaActual, this.maxPagina);
    const inicio = (actual - 1) * this.porPagina;
    return this.plantillasFiltradas.slice(inicio, inicio + this.porPagina);
  }

  cambiarPagina(dir: number) {
    if (this.paginaActual > this.maxPagina) {
      this.paginaActual = this.maxPagina;
    }
    const nueva = this.paginaActual + dir;
    if (nueva >= 1 && nueva <= this.maxPagina) {
      this.paginaActual = nueva;
    }
  }

  limpiarFiltros(): void {
    this.buscar = '';
    this.filtrCategoria = '';
  }

  abrirDetalle(plantilla: PlantillaCarrera): void {
    this.plantillaSeleccionada = plantilla;
    this.observaciones = '';
    this.prioridadSolicitud = 'Normal';
    this.enviandoSolicitud = false;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.plantillaSeleccionada = null;
    this.observaciones = '';
    this.prioridadSolicitud = 'Normal';
    this.enviandoSolicitud = false;
    this.documentosRequisito = {};
    this.documentosRequisitoNombres = {};
  }

  obtenerAceptacionRequisito(extensionesPermitidas: string): string {
    return (extensionesPermitidas || '')
      .split(',')
      .map((extension) => extension.trim())
      .filter(Boolean)
      .map((extension) => (extension.startsWith('.') ? extension : `.${extension}`))
      .join(',');
  }

  manejarDocumentoRequisito(requisito: RequisitoTramite, event: Event): void {
    const input = event.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    if (!archivo) {
      return;
    }

    this.documentosRequisito[requisito.idRequisito] = archivo;
    this.documentosRequisitoNombres[requisito.idRequisito] = archivo.name;
    this.cdr.detectChanges();
  }

  obtenerRequisitosSeleccionados(): RequisitoTramite[] {
    const plantilla = this.plantillaSeleccionada;
    if (!plantilla) {
      return [];
    }

    return plantilla.requisitosTramite.filter((requisito) => !!this.documentosRequisito[requisito.idRequisito]);
  }

  obtenerRequisitosFaltantes(): RequisitoTramite[] {
    const plantilla = this.plantillaSeleccionada;
    if (!plantilla) {
      return [];
    }

    return plantilla.requisitosTramite.filter((requisito) => requisito.esObligatorio && !this.documentosRequisito[requisito.idRequisito]);
  }

  construirFormDataSolicitud(): FormData | null {
    const plantilla = this.plantillaSeleccionada;
    if (!plantilla) {
      return null;
    }

    const requisitosSeleccionados = this.obtenerRequisitosSeleccionados();
    const archivos = requisitosSeleccionados
      .map((requisito) => this.documentosRequisito[requisito.idRequisito])
      .filter((archivo): archivo is File => !!archivo);

    const solicitud: CrearSolicitudRequestDTO = {
      idPlantilla: plantilla.idPlantilla,
      detallesSolicitud: this.observaciones.trim(),
      prioridad: this.prioridadSolicitud || 'Normal',
      pasoActual: 1,
      idsRequisitos: requisitosSeleccionados.map((requisito) => requisito.idRequisito)
    };

    const formData = new FormData();
    formData.append('solicitud', new Blob([JSON.stringify(solicitud)], { type: 'application/json' }));

    for (const archivo of archivos) {
      formData.append('archivos', archivo, archivo.name);
    }

    return formData;
  }

  enviarSolicitud(): void {
    const plantilla = this.plantillaSeleccionada;
    if (!plantilla || this.enviandoSolicitud) {
      return;
    }

    const requisitosFaltantes = this.obtenerRequisitosFaltantes();
    if (requisitosFaltantes.length > 0) {
      const nombres = requisitosFaltantes.map((requisito) => requisito.nombreRequisito).join(', ');
      this.error = `Faltan documentos obligatorios: ${nombres}.`;
      this.toastService.show('Documentos pendientes', this.error, 'warning');
      return;
    }

    const formData = this.construirFormDataSolicitud();
    if (!formData) {
      this.toastService.show('Error', 'No se pudo construir el envío de la solicitud.', 'error');
      return;
    }

    const archivosSeleccionados = this.obtenerRequisitosSeleccionados().length;
    if (archivosSeleccionados === 0) {
      this.error = 'Debes adjuntar al menos un documento para enviar la solicitud.';
      this.toastService.show('Documentos pendientes', this.error, 'warning');
      return;
    }

    this.enviandoSolicitud = true;
    this.cdr.detectChanges();

    this.loadingService.withMinDuration(this.tramitesService.crearSolicitud(formData)).subscribe({
      next: (respuesta) => {
        this.enviandoSolicitud = false;
        this.cdr.detectChanges();
        this.toastService.show(
          'Solicitud creada',
          `${respuesta.mensaje} (${respuesta.cantidadArchivos} archivo${respuesta.cantidadArchivos === 1 ? '' : 's'} adjunto${respuesta.cantidadArchivos === 1 ? '' : 's'}).`,
          'success'
        );
        console.log('Solicitud creada', respuesta);
        this.cerrarModal();
      },
      error: (err) => {
        this.enviandoSolicitud = false;
        this.cdr.detectChanges();
        const detalle = err?.error?.message || err?.message || 'Error desconocido';
        this.error = `No se pudo enviar la solicitud: ${detalle}`;
        this.toastService.show('Error', this.error, 'error');
        console.error('Error al enviar solicitud:', err);
      }
    });
  }
}
