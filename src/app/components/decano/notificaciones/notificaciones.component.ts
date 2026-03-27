import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingService } from '../../../services/general/loading.service';
import { LoadingComponent } from '../../shared/loading/loading.component';
import { ToastService } from '../../../services/general/toast.service';
import { ConfiguracionUsuarioService } from '../../../services/general/configuracion-usuario.service';
import { NotificacionService, NotificacionDTO } from '../../../services/general/notificacion.service';

interface Notificacion {
  id: number;
  icono: string;
  titulo: string;
  mensaje: string;
  tiempo: string;
  leida: boolean;
  tipo: string;
}

@Component({
  selector: 'app-decano-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.css'],
})
export class DecanoNotificacionesComponent implements OnInit {
  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 5;
  cargando = signal(false);

  notificaciones = signal<Notificacion[]>([]);

  prefs = signal({
    wa: false,
    mail: true,
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
      recibidas: all.length,
      tasa: all.length > 0 ? Math.round((all.filter(n => n.leida).length / all.length) * 100) + '%' : '0%'
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

  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private configService: ConfiguracionUsuarioService,
    private notificacionService: NotificacionService
  ) {}

  ngOnInit() {
    this.cargarNotificaciones();
    this.cargarPreferencias();
  }

  cargarPreferencias(): void {
    this.configService.obtenerMisPreferencias().subscribe({
      next: (config) => {
        this.prefs.set({
          wa: config.notificarWhatsapp ?? false,
          mail: config.notificarEmail ?? true,
        });
      },
      error: () => {}
    });
  }

  cargarNotificaciones(): void {
    this.cargando.set(true);
    this.loadingService.withMinDuration(this.notificacionService.obtenerMisNotificaciones()).subscribe({
      next: (data) => {
        this.notificaciones.set(data.map(n => this.mapearNotificacion(n)));
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  private mapearNotificacion(dto: NotificacionDTO): Notificacion {
    return {
      id: dto.idNotificacion,
      icono: this.obtenerIcono(dto.titulo),
      titulo: dto.titulo,
      mensaje: dto.mensaje,
      tiempo: this.tiempoRelativo(dto.fechaCreacion),
      leida: dto.estaLeida,
      tipo: dto.canal ?? 'Sistema',
    };
  }

  private obtenerIcono(titulo: string): string {
    const t = titulo.toLowerCase();
    if (t.includes('rechazada')) return 'bi-x-circle-fill';
    if (t.includes('finalizada')) return 'bi-check-circle-fill';
    if (t.includes('aprobada')) return 'bi-arrow-repeat';
    if (t.includes('acción requerida')) return 'bi-exclamation-triangle-fill';
    if (t.includes('registrada') || t.includes('creada')) return 'bi-inbox-fill';
    return 'bi-bell-fill';
  }

  private tiempoRelativo(fecha: string): string {
    if (!fecha) return '';
    const ahora = new Date();
    const f = new Date(fecha);
    const diff = ahora.getTime() - f.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Justo ahora';
    if (mins < 60) return `Hace ${mins} min`;
    const horas = Math.floor(mins / 60);
    if (horas < 24) return `Hace ${horas}h`;
    const dias = Math.floor(horas / 24);
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;
    return f.toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' });
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

  marcarLeida(id: number, e?: Event) {
    if (e) e.stopPropagation();
    this.notificacionService.marcarLeida(id).subscribe({
      next: () => {
        this.notificaciones.update(arr => {
          const i = arr.findIndex(x => x.id === id);
          if (i > -1) arr[i] = { ...arr[i], leida: true };
          return [...arr];
        });
        if (this.notificacionSeleccionada()?.id === id) {
          this.cerrarModal();
        }
      }
    });
  }

  irAlTramite() {
    this.cerrarModal();
    this.router.navigate(['/decano/solicitudes']);
  }

  guardarPrefs() {
    this.configService.guardarCanales({
      whatsapp: this.prefs().wa,
      correo: this.prefs().mail,
    }).subscribe({
      next: () => this.toastService.show('Éxito', 'Preferencias guardadas exitosamente.', 'success'),
      error: () => this.toastService.show('Error', 'No se pudieron guardar las preferencias.', 'error'),
    });
  }

  restablecerPrefs() {
    this.prefs.set({ wa: false, mail: true });
  }
}
