import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { ToastService } from '../../../services/general/toast.service';
import { SolicitudDetalleResponse, PasoFlujoItem } from '../../../models/coordinador/plantilla.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css']
})
// Bandeja operativa del coordinador para revisar, aprobar o rechazar solicitudes.
export class SolicitudesComponent implements OnInit {
  readonly rolGestion = 'coordinador';

  buscar = '';
  filtroEstado = '';
  paginaActual = 1;
  porPagina = 6;
  cargando = false;
  error = '';

  solicitudes: SolicitudDetalleResponse[] = [];
  solicitudSeleccionada: SolicitudDetalleResponse | null = null;
  cargandoDetalle = false;

  // Modal confirmacion
  showConfirmModal = false;
  confirmAccion: 'aprobar' | 'rechazar' | null = null;
  confirmInput = '';
  comentarioAccion = '';
  ejecutandoAccion = false;

  constructor(
    private tramitesService: TramitesService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    // Obtiene solo las solicitudes gestionables por el rol configurado en esta vista.
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.loadingService.withMinDuration(this.tramitesService.getSolicitudesPorRol(this.rolGestion)).subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar las solicitudes.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarSolicitud(sol: SolicitudDetalleResponse): void {
    // Carga el detalle completo para habilitar timeline, documentos y acciones.
    this.cargandoDetalle = true;
    this.cdr.detectChanges();

    this.tramitesService.getDetalleSolicitud(sol.idSolicitud).subscribe({
      next: (detalle) => {
        this.solicitudSeleccionada = detalle;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.solicitudSeleccionada = sol;
        this.cargandoDetalle = false;
        this.cdr.detectChanges();
      },
    });
  }

  // --- Filtros y paginacion ---

  get solicitudesFiltradas(): SolicitudDetalleResponse[] {
    const q = this.buscar.trim().toLowerCase();
    return this.solicitudes.filter(s => {
      const textoOk = !q ||
        (s.codigoSolicitud || '').toLowerCase().includes(q) ||
        (s.nombrePlantilla || '').toLowerCase().includes(q) ||
        (s.nombreUsuario || '').toLowerCase().includes(q) ||
        (s.estadoActual || '').toLowerCase().includes(q);
      const estadoOk = !this.filtroEstado || s.estadoActual === this.filtroEstado;
      return textoOk && estadoOk;
    });
  }

  get stats() {
    const all = this.solicitudes;
    return {
      pendientes: all.filter(s => s.estadoActual === 'pendiente').length,
      enProceso: all.filter(s => s.estadoActual === 'en_proceso').length,
      finalizadas: all.filter(s => s.estadoActual === 'finalizado').length,
      rechazadas: all.filter(s => s.estadoActual === 'rechazado').length,
      total: all.length,
    };
  }

  get maxPagina(): number {
    return Math.ceil(this.solicitudesFiltradas.length / this.porPagina) || 1;
  }

  get solicitudesPaginadas(): SolicitudDetalleResponse[] {
    const actual = Math.min(this.paginaActual, this.maxPagina);
    const inicio = (actual - 1) * this.porPagina;
    return this.solicitudesFiltradas.slice(inicio, inicio + this.porPagina);
  }

  cambiarPagina(dir: number): void {
    const nueva = this.paginaActual + dir;
    if (nueva >= 1 && nueva <= this.maxPagina) this.paginaActual = nueva;
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = this.filtroEstado === estado ? '' : estado;
    this.paginaActual = 1;
  }

  // --- Gestion de pasos ---

  obtenerPasoActual(): PasoFlujoItem | null {
    const sol = this.solicitudSeleccionada;
    if (!sol?.pasosFlujo || !sol.idPasoActual) return null;
    return sol.pasosFlujo.find(p => p.idPaso === sol.idPasoActual) || null;
  }

  puedeGestionar(): boolean {
    const paso = this.obtenerPasoActual();
    const sol = this.solicitudSeleccionada;
    if (!paso || !sol) return false;
    if (sol.estadoActual === 'finalizado' || sol.estadoActual === 'rechazado') return false;
    return (paso.rolRequerido || '').toLowerCase() === this.rolGestion.toLowerCase();
  }

  obtenerEstadoPaso(paso: PasoFlujoItem): 'done' | 'current' | 'pending' | 'rejected' {
    const sol = this.solicitudSeleccionada;
    if (!sol) return 'pending';
    if (sol.estadoActual === 'rechazado') {
      const pasoActual = sol.pasosFlujo.find(p => p.idPaso === sol.idPasoActual);
      if (pasoActual && paso.ordenPaso === pasoActual.ordenPaso) return 'rejected';
      if (pasoActual && paso.ordenPaso < pasoActual.ordenPaso) return 'done';
      return 'pending';
    }
    const pasoActual = sol.pasosFlujo.find(p => p.idPaso === sol.idPasoActual);
    if (!pasoActual) {
      return sol.estadoActual === 'finalizado' ? 'done' : 'pending';
    }
    if (paso.ordenPaso < pasoActual.ordenPaso) return 'done';
    if (paso.ordenPaso === pasoActual.ordenPaso) return 'current';
    return 'pending';
  }

  // --- Modal de confirmacion ---

  get textoRequerido(): string {
    return this.confirmAccion === 'aprobar' ? 'CONFIRMAR APROBACION' : 'CONFIRMAR RECHAZO';
  }

  abrirConfirmacion(accion: 'aprobar' | 'rechazar'): void {
    if (!this.solicitudSeleccionada) return;
    this.confirmAccion = accion;
    this.confirmInput = '';
    this.comentarioAccion = '';
    this.showConfirmModal = true;
  }

  cerrarConfirmacion(): void {
    this.showConfirmModal = false;
    this.confirmAccion = null;
    this.confirmInput = '';
    this.comentarioAccion = '';
  }

  ejecutarAccion(): void {
    // Ejecuta transicion del flujo actual (aprobar/rechazar) y sincroniza vista local.
    if (this.confirmInput !== this.textoRequerido || !this.solicitudSeleccionada) return;

    this.ejecutandoAccion = true;
    this.cdr.detectChanges();

    const dto = {
      idSolicitud: this.solicitudSeleccionada.idSolicitud,
      comentarios: this.comentarioAccion || undefined,
    };

    const accion$ = this.confirmAccion === 'aprobar'
      ? this.tramitesService.aprobarPaso(dto)
      : this.tramitesService.rechazarSolicitud(dto);

    accion$.subscribe({
      next: (res) => {
        this.ejecutandoAccion = false;
        this.toastService.show(
          this.confirmAccion === 'aprobar' ? 'Paso Aprobado' : 'Solicitud Rechazada',
          res.mensaje,
          this.confirmAccion === 'aprobar' ? 'success' : 'warning'
        );
        this.cerrarConfirmacion();
        // Recargar detalle y lista
        if (this.solicitudSeleccionada) {
          this.seleccionarSolicitud(this.solicitudSeleccionada);
        }
        this.cargarSolicitudes();
      },
      error: (err) => {
        this.ejecutandoAccion = false;
        const msg = err?.error?.message || 'Error al ejecutar la acción.';
        this.toastService.show('Error', msg, 'error');
        this.cdr.detectChanges();
      },
    });
  }

  // --- Helpers ---

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'info';
      case 'finalizado': return 'success';
      case 'rechazado': return 'danger';
      default: return 'warning';
    }
  }

  obtenerEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'finalizado': return 'Finalizado';
      case 'rechazado': return 'Rechazado';
      default: return estado;
    }
  }

  formatearFecha(fecha: string | null): string {
    if (!fecha) return '—';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  formatearFechaHora(fecha: string | null): string {
    if (!fecha) return 'Pendiente';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-PE', { year: 'numeric', month: 'short', day: 'numeric' })
      + ' · ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }

  formatearTamano(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  obtenerIconoArchivo(tipoMime: string | null): string {
    if (!tipoMime) return 'bi-file-earmark';
    if (tipoMime.includes('pdf')) return 'bi-file-earmark-pdf-fill';
    if (tipoMime.includes('image')) return 'bi-file-earmark-image-fill';
    return 'bi-file-earmark-fill';
  }

  descargarArchivo(doc: any): void {
    if (doc.rutaArchivo) window.open(doc.rutaArchivo, '_blank');
  }
}
