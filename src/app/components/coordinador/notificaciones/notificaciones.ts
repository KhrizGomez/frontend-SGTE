import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoadingService } from '../../../services/general/loading.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

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
  selector: 'app-coordinador-notificaciones',
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

  constructor(private router: Router, private loadingService: LoadingService) {}

  ngOnInit() {
    this.cargarNotificaciones();

    try {
      const saved = JSON.parse(localStorage.getItem('coNotifPrefs') || '{}');
      this.prefs.set({ ...this.prefs(), ...saved });
    } catch {}
  }

  cargarNotificaciones(): void {
    const mockData: Notificacion[] = [
      { id: 'N-3001', icono: 'bi-exclamation-triangle-fill', titulo: 'Falta documento en trámite C-2102', mensaje: 'Sube el sustentante de convalidación.', tiempo: 'Hace 6 minutos', leida: false, tipo: 'Urgente', prioridad: 'Alta' },
      { id: 'N-3002', icono: 'bi-arrow-repeat', titulo: 'Recordatorio de etapa pendiente', mensaje: 'Caso C-2101 lleva 2 días en la misma etapa.', tiempo: 'Hace 1 hora', leida: false, tipo: 'Seguimiento', prioridad: 'Media' },
      { id: 'N-3003', icono: 'bi-inbox-fill', titulo: 'Nueva solicitud recibida', mensaje: 'Caso C-2110 creado por Secretaría.', tiempo: 'Hoy 09:10', leida: false, tipo: 'Sistema', prioridad: 'Baja' },
      { id: 'N-3004', icono: 'bi-calendar-check-fill', titulo: 'Vence plazo de revisión', mensaje: 'Caso C-2105 vence mañana.', tiempo: 'Ayer 18:30', leida: true, tipo: 'Resolución', prioridad: 'Alta' }
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
    this.router.navigate(['/coordinacion/solicitudes']);
  }

  guardarPrefs() {
    localStorage.setItem('coNotifPrefs', JSON.stringify(this.prefs()));
    alert('Preferencias guardadas exitosamente.');
  }

  restablecerPrefs() {
    this.prefs.set({ wa: false, mail: true, app: true, sms: false });
    localStorage.removeItem('coNotifPrefs');
  }
}
