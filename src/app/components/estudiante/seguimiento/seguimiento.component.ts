import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { ToastService } from '../../../services/general/toast.service';
import { SolicitudDetalleResponse } from '../../../models/coordinador/plantilla.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-estudiante-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css']
})
export class EstudianteSeguimiento implements OnInit {
  buscar = '';
  filtroEstado = '';
  paginaActual = 1;
  porPagina = 6;
  cargando = false;
  error = '';

  solicitudes: SolicitudDetalleResponse[] = [];
  solicitudSeleccionada: SolicitudDetalleResponse | null = null;
  cargandoDetalle = false;

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
    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    this.loadingService.withMinDuration(this.tramitesService.getMisSolicitudes()).subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar tus solicitudes. Intente nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  seleccionarSolicitud(sol: SolicitudDetalleResponse): void {
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
        this.toastService.show('Error', 'No se pudo cargar el detalle completo.', 'error');
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
        (s.categoria || '').toLowerCase().includes(q) ||
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
      observadas: all.filter(s => s.estadoActual === 'observado' || s.estadoActual === 'rechazado').length,
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
    if (nueva >= 1 && nueva <= this.maxPagina) {
      this.paginaActual = nueva;
    }
  }

  filtrarPorEstado(estado: string): void {
    this.filtroEstado = this.filtroEstado === estado ? '' : estado;
    this.paginaActual = 1;
  }

  // --- Helpers de presentacion ---

  obtenerClaseEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'warning';
      case 'en_proceso': return 'info';
      case 'finalizado': return 'success';
      case 'rechazado':
      case 'observado': return 'danger';
      default: return 'warning';
    }
  }

  obtenerEtiquetaEstado(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'finalizado': return 'Finalizado';
      case 'rechazado': return 'Rechazado';
      case 'observado': return 'Observado';
      default: return estado;
    }
  }

  obtenerClasePrioridad(prioridad: string): string {
    switch (prioridad?.toLowerCase()) {
      case 'alta':
      case 'urgente': return 'danger';
      case 'media':
      case 'normal': return 'warning';
      case 'baja': return 'success';
      default: return 'warning';
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
    if (tipoMime.includes('word') || tipoMime.includes('document')) return 'bi-file-earmark-word-fill';
    if (tipoMime.includes('excel') || tipoMime.includes('spreadsheet')) return 'bi-file-earmark-excel-fill';
    return 'bi-file-earmark-fill';
  }

  obtenerColorIcono(tipoMime: string | null): string {
    if (!tipoMime) return '#6c757d';
    if (tipoMime.includes('pdf')) return '#dc2626';
    if (tipoMime.includes('image')) return '#2563eb';
    if (tipoMime.includes('word')) return '#2563eb';
    if (tipoMime.includes('excel')) return '#059669';
    return '#6c757d';
  }

  obtenerEstadoTimeline(histItem: any, index: number, historial: any[]): 'done' | 'current' | 'pending' {
    if (histItem.fechaCompletado) return 'done';
    if (histItem.fechaEntrada && !histItem.fechaCompletado) return 'current';
    return 'pending';
  }

  descargarArchivo(doc: any): void {
    if (doc.rutaArchivo) {
      window.open(doc.rutaArchivo, '_blank');
    }
  }
}
