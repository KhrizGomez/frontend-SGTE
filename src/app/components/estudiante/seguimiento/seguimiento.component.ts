import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LoadingService } from '../../../services/general/loading.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

interface TimelineStep {
  name: string;
  meta: string;
  desc?: string;
  state: 'done' | 'current' | 'pending';
}

interface TramiteFile {
  name: string;
  size: string;
}

interface Tramite {
  id: string;
  titulo: string;
  tipo: string;
  prioridad: string;
  estado: string;
  fecha: string;
  creado: string;
  actual: string;
  files: TramiteFile[];
  tl: TimelineStep[];
}

@Component({
  selector: 'app-estudiante-seguimiento',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.css']
})
export class EstudianteSeguimiento implements OnInit {
  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 5;
  cargando = signal(false);

  tramites = signal<Tramite[]>([]);

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.cargarTramites();
  }

  cargarTramites(): void {
    const mockData: Tramite[] = [
      {
        id: 'C-2101',
        titulo: 'Cambio de carrera - Juan Pérez',
        tipo: 'Cambio de carrera',
        prioridad: 'Alta',
        estado: 'Etapa 2/5',
        fecha: '2025-09-25',
        creado: '2025-09-10',
        actual: '2025-09-18',
        files: [{ name: 'carta.pdf', size: '120KB' }],
        tl: [
          { name: 'Solicitud recibida', meta: '2025-09-10 · 09:44', desc: 'Tu solicitud fue registrada en el sistema.', state: 'done' },
          { name: 'Revisión de documentos', meta: '2025-09-12 · 13:02', desc: 'Se revisó la documentación.', state: 'done' },
          { name: 'Enviado a coordinación', meta: '2025-09-17 · 10:21', desc: 'En evaluación por coordinación.', state: 'current' },
          { name: 'Resolución final', meta: 'Pendiente', desc: 'A la espera de resolución.', state: 'pending' }
        ]
      },
      {
        id: 'C-2102',
        titulo: 'Homologación de materias - María López',
        tipo: 'Homologación',
        prioridad: 'Urgente',
        estado: 'Etapa 3/5',
        fecha: '2025-09-27',
        creado: '2025-09-08',
        actual: '2025-09-19',
        files: [],
        tl: [
          { name: 'Solicitud recibida', meta: '2025-09-08 · 10:00', state: 'done' },
          { name: 'Revisión de documentos', meta: '2025-09-09 · 15:10', state: 'done' },
          { name: 'Enviado a coordinación', meta: '2025-09-12 · 12:20', state: 'done' },
          { name: 'Resolución en decanato', meta: '2025-09-15 · 10:00', state: 'current' },
          { name: 'Notificación', meta: 'Pendiente', state: 'pending' }
        ]
      },
      {
        id: 'C-2103',
        titulo: 'Certificado de matrícula - Carlos Ruiz',
        tipo: 'Certificados académicos',
        prioridad: 'Media',
        estado: 'Etapa 2/5',
        fecha: '2025-09-22',
        creado: '2025-09-14',
        actual: '2025-09-15',
        files: [
          { name: 'solicitud_firmada.pdf', size: '250KB' },
          { name: 'comprobante_pago.jpg', size: '1.2MB' }
        ],
        tl: [
          { name: 'Solicitud recibida', meta: '2025-09-14 · 08:30', state: 'done' },
          { name: 'Revisión de pago', meta: '2025-09-15 · 09:15', state: 'current' },
          { name: 'Emisión de certificado', meta: 'Pendiente', state: 'pending' }
        ]
      }
    ];

    this.cargando.set(true);
    this.loadingService.withMinDuration(of(mockData)).subscribe({
      next: (data) => {
        this.tramites.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.cargando.set(false);
      }
    });
  }

  tramitesFiltrados = computed(() => {
    const q = this.buscar().toLowerCase();
    return this.tramites().filter(t =>
      t.id.toLowerCase().includes(q) ||
      t.titulo.toLowerCase().includes(q) ||
      t.estado.toLowerCase().includes(q) ||
      t.tipo.toLowerCase().includes(q)
    );
  });

  stats = computed(() => {
    const all = this.tramites();
    return {
      revision: all.length,
      finalizadas: all.filter(t => t.estado === 'Finalizado').length,
      observadas: all.filter(t => t.estado === 'Observado').length,
      total: all.length
    };
  });

  paginacion = computed(() => {
    const total = this.tramitesFiltrados().length;
    const maxPagina = Math.ceil(total / this.porPagina) || 1;
    let actual = this.paginaActual();
    if (actual > maxPagina) actual = maxPagina;

    const inicio = (actual - 1) * this.porPagina;
    const items = this.tramitesFiltrados().slice(inicio, inicio + this.porPagina);
    return { items, actual, maxPagina, total };
  });

  tramiteSeleccionado = signal<Tramite | null>(null);

  cambiarPagina(dir: number) {
    const nueva = this.paginaActual() + dir;
    const m = Math.ceil(this.tramitesFiltrados().length / this.porPagina);
    if (nueva >= 1 && nueva <= m) {
      this.paginaActual.set(nueva);
    }
  }

  seleccionarTramite(t: Tramite) {
    this.tramiteSeleccionado.set(t);
  }

  // Modal State
  fileModalOpen = signal(false);
  fileSelected = signal<{ id: string; file: TramiteFile } | null>(null);

  abrirArchivo(t: Tramite, f: TramiteFile) {
    this.fileSelected.set({ id: t.id, file: f });
    this.fileModalOpen.set(true);
  }

  cerrarArchivo() {
    this.fileModalOpen.set(false);
    this.fileSelected.set(null);
  }

  descargarArchivo() {
    const sel = this.fileSelected();
    if (sel) {
      const blob = new Blob([`Contenido de ${sel.file.name}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = sel.file.name;
      document.body.appendChild(a); a.click();
      URL.revokeObjectURL(url); a.remove();
    }
  }
}
