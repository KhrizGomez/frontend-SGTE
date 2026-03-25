import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoadingService } from '../../../services/general/loading.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ToastService } from '../../../services/general/toast.service';

interface Notificacion {
  id: string;
  icono: string;
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
  tipo: string;
  prioridad: string;
}

@Component({
  selector: 'app-decano-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './notificaciones.html',
  styleUrls: ['./notificaciones.css'],
})
export class Notificaciones implements OnInit {
  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 5;
  cargando = signal(false);

  notificaciones = signal<Notificacion[]>([]);

  prefs = signal({
    wa: false,
    mail: true,
    app: true,
    sms: false
  });

  notificacionesFiltradas = computed(() => {
    const q = this.buscar().toLowerCase();
    return this.notificaciones().filter(n =>
      n.titulo.toLowerCase().includes(q) ||
      n.mensaje.toLowerCase().includes(q) ||
      n.tipo.toLowerCase().includes(q)
    );
  });

  stats = computed(() => {
    const all = this.notificaciones();
    return {
      sinLeer: all.filter(n => !n.leida).length,
      importantes: all.filter(n => n.prioridad === 'Alta').length,
      recibidas: all.length,
      tasa: '95%'
    };
  });

  paginacion = computed(() => {
    const total = this.notificacionesFiltradas().length;
    const maxPagina = Math.ceil(total / this.porPagina) || 1;
    let actual = this.paginaActual();
    if (actual > maxPagina) actual = maxPagina;

    const inicio = (actual - 1) * this.porPagina;
    const items = this.notificacionesFiltradas().slice(inicio, inicio + this.porPagina);
    return { items, actual, maxPagina, total };
  });

  notificacionSeleccionada = signal<Notificacion | null>(null);
  showModal = signal(false);

  constructor(private router: Router, private loadingService: LoadingService, private toastService: ToastService) {}

  ngOnInit() {
    this.cargarNotificaciones();

    try {
      const saved = JSON.parse(localStorage.getItem('decanoNotifPrefs') || '{}');
      this.prefs.set({ ...this.prefs(), ...saved });
    } catch {}
  }

  cargarNotificaciones(): void {
    const mockData: Notificacion[] = [
      { id: 'N-4001', icono: 'bi-exclamation-triangle-fill', titulo: 'Aprobación pendiente', mensaje: 'Trámite C-2101 requiere su aprobación.', tiempo: 'Hace 10 minutos', leida: false, tipo: 'Resolución', prioridad: 'Alta' },
      { id: 'N-4002', icono: 'bi-arrow-repeat', titulo: 'Actualización en trámite', mensaje: 'Caso C-2102 validado por Coordinación.', tiempo: 'Hace 2 horas', leida: false, tipo: 'Seguimiento', prioridad: 'Media' },
      { id: 'N-4003', icono: 'bi-inbox-fill', titulo: 'Reporte semanal generado', mensaje: 'El informe de trámites de la semana está listo.', tiempo: 'Ayer 10:00', leida: true, tipo: 'Sistema', prioridad: 'Baja' }
    ];

    this.cargando.set(true);
    this.loadingService.withMinDuration(of(mockData)).subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  cambiarPagina(dir: number) {
    const nueva = this.paginaActual() + dir;
    const m = Math.ceil(this.notificacionesFiltradas().length / this.porPagina);
    if (nueva >= 1 && nueva <= m) {
      this.paginaActual.set(nueva);
    }
  }

  abrirNotificacion(n: Notificacion) {
    this.notificacionSeleccionada.set(n);
    this.showModal.set(true);
  }

  cerrarModal() {
    this.showModal.set(false);
    this.notificacionSeleccionada.set(null);
  }

  marcarLeida(id: string, e?: Event) {
    if (e) e.stopPropagation();
    this.notificaciones.update(arr => {
      const i = arr.findIndex(x => x.id === id);
      if (i > -1) arr[i] = { ...arr[i], leida: true };
      return [...arr];
    });
    if (this.notificacionSeleccionada()?.id === id) {
      this.cerrarModal();
    }
  }

  irAlTramite() {
    this.cerrarModal();
    this.router.navigate(['/decano/solicitudes']);
  }

  guardarPrefs() {
    localStorage.setItem('decanoNotifPrefs', JSON.stringify(this.prefs()));
    this.toastService.show('Éxito', 'Preferencias guardadas exitosamente.', 'success');
  }

  restablecerPrefs() {
    this.prefs.set({ wa: false, mail: true, app: true, sms: false });
    localStorage.removeItem('decanoNotifPrefs');
  }
}
