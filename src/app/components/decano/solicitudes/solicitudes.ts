import { Component, computed, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { LoadingService } from '../../../services/general/loading.service';
import { LoadingComponent } from '../../shared/loading/loading.component';

interface TimelineStep {
  name: string;
  role: string;
  started: string | null;
  done: string | null;
}

interface TramiteFile {
  name: string;
  size: string;
}

interface Tramite {
  id: string;
  titulo: string;
  estudiante: string;
  tipo: string;
  prioridad: string;
  estado: string;
  creado: string;
  actualizado: string;
  files: TramiteFile[];
  steps: TimelineStep[];
  current: number;
}

@Component({
  selector: 'app-decano-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './solicitudes.html',
  styleUrls: ['./solicitudes.css']
})
export class Solicitudes implements OnInit {
  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 5;
  cargando = signal(false);

  // Modals state
  showConfirmModal = signal(false);
  confirmAccion = signal<'aprobar'|'rechazar'|null>(null);
  confirmInput = signal('');
  tramiteAConfirmar = signal<Tramite | null>(null);

  flowMap = {
    basico: [
      {name:'Recepción', role:'Coordinador'},
      {name:'Revisión', role:'Coordinador'},
      {name:'Aprobación', role:'Decano'},
      {name:'Notificación', role:'Coordinador'},
      {name:'Finalizado', role:'Coordinador'}
    ],
    validacion: [
      {name:'Recepción', role:'Coordinador'},
      {name:'Validación documental', role:'Coordinador'},
      {name:'Revisión coordinación', role:'Coordinador'},
      {name:'Aprobación decanato', role:'Decano'},
      {name:'Finalizado', role:'Coordinador'}
    ],
    homologacion: [
      {name:'Recepción', role:'Coordinador'},
      {name:'Evaluación de homologación', role:'Coordinador'},
      {name:'Resolución', role:'Decano'},
      {name:'Notificación', role:'Coordinador'},
      {name:'Finalizado', role:'Coordinador'}
    ]
  };

  tramites = signal<Tramite[]>([]);

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.cargarSolicitudes();
  }

  cargarSolicitudes(): void {
    // Decano mock data
    const mockData: Tramite[] = [
      { id:'C-2101', titulo:'Cambio de carrera - Juan Pérez', estudiante:'Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'En revisión', creado:'2025-09-02', actualizado:'2025-09-04', files:[ {name:'Solicitud.pdf', size:'120 KB'}, {name:'HistorialAcademico.pdf', size:'340 KB'} ], steps: this.flowMap.validacion.map((s,idx)=>({ ...s, started: idx<=2? '2025-09-02': null, done: idx<2? '2025-09-03': null })), current: 3 },
      { id:'C-2102', titulo:'Homologación de materias - María López', estudiante:'María López', tipo:'Homologación', prioridad:'Urgente', estado:'Evaluación requerida', creado:'2025-09-01', actualizado:'2025-09-05', files:[ {name:'Programas.pdf', size:'1.2 MB'} ], steps: this.flowMap.homologacion.map((s,idx)=>({ ...s, started: idx<=2? '2025-09-01': null, done: idx<2? '2025-09-04' : null })), current: 2 },
      { id:'C-2103', titulo:'Certificado de matrícula - Carlos Ruiz', estudiante:'Carlos Ruiz', tipo:'Certificados', prioridad:'Media', estado:'Pendiente', creado:'2025-09-03', actualizado:'2025-09-03', files:[ {name:'Comprobante.pdf', size:'85 KB'} ], steps: this.flowMap.basico.map((s,idx)=>({ ...s, started: idx<=2? '2025-09-03': null, done: idx<2? '2025-09-03' : null })), current: 2 }
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

  stats = computed(() => {
    const all = this.tramites();
    return {
      pendientes: all.filter(t => t.estado === 'Pendiente' || t.estado.includes('requerida')).length,
      enRevision: all.filter(t => t.estado === 'En revisión' || t.estado.includes('progreso')).length,
      finalizadas: all.filter(t => t.estado === 'Finalizado' || t.estado === 'Rechazado').length,
      total: all.length
    };
  });

  tramitesFiltrados = computed(() => {
    const q = this.buscar().toLowerCase();
    return this.tramites().filter(t => 
      t.id.toLowerCase().includes(q) || 
      t.titulo.toLowerCase().includes(q) || 
      t.estado.toLowerCase().includes(q) ||
      t.estudiante.toLowerCase().includes(q)
    );
  });

  paginacion = computed(() => {
    const total = this.tramitesFiltrados().length;
    const maxPagina = Math.ceil(total / this.porPagina) || 1;
    let actual = this.paginaActual();
    if(actual > maxPagina) actual = maxPagina;
    
    const inicio = (actual - 1) * this.porPagina;
    const items = this.tramitesFiltrados().slice(inicio, inicio + this.porPagina);
    return { items, actual, maxPagina, total };
  });

  tramiteSeleccionado = signal<Tramite | null>(null);

  cambiarPagina(dir: number) {
    const nueva = this.paginaActual() + dir;
    const m = Math.ceil(this.tramitesFiltrados().length / this.porPagina);
    if(nueva >= 1 && nueva <= m) {
      this.paginaActual.set(nueva);
    }
  }

  seleccionarTramite(t: Tramite) {
    this.tramiteSeleccionado.set(t);
  }

  get textoRequerido() {
    return this.confirmAccion() === 'aprobar' ? 'CONFIRMAR APROBACION' : 'CONFIRMAR RECHAZO';
  }

  abrirConfirmacion(accion: 'aprobar'|'rechazar') {
    const t = this.tramiteSeleccionado();
    if(!t) return;
    this.tramiteAConfirmar.set(t);
    this.confirmAccion.set(accion);
    this.confirmInput.set('');
    this.showConfirmModal.set(true);
  }

  cerrarConfirmacion() {
    this.showConfirmModal.set(false);
    this.tramiteAConfirmar.set(null);
    this.confirmAccion.set(null);
  }

  ejecutarAccion() {
    if(this.confirmInput() !== this.textoRequerido) return;

    const t = this.tramiteAConfirmar();
    const accion = this.confirmAccion();
    
    if(t && accion) {
      t.actualizado = new Date().toISOString().split('T')[0];
      
      if(accion === 'aprobar' && t.current < t.steps.length) {
        t.steps[t.current].done = t.actualizado;
        t.current++;
        if(t.current < t.steps.length) {
          t.steps[t.current].started = t.actualizado;
          t.estado = `Aprobado por Decanato. En progreso (Paso ${t.current + 1})`;
        } else {
          t.estado = 'Finalizado';
          t.current = 100;
        }
      } else if(accion === 'rechazar') {
        t.estado = 'Rechazado';
        t.current = 99; // Error state
      }

      // Force update by replacing ref
      this.tramites.update(arr => {
        const i = arr.findIndex(x => x.id === t.id);
        if(i > -1) arr[i] = {...t};
        return [...arr];
      });

      // Update selected reference as well
      this.tramiteSeleccionado.set({...t});
    }

    this.cerrarConfirmacion();
  }

  // File Modal
  fileModalOpen = signal(false);
  fileSelected = signal<{id: string, file: TramiteFile} | null>(null);

  abrirArchivo(t: Tramite, f: TramiteFile) {
    this.fileSelected.set({id: t.id, file: f});
    this.fileModalOpen.set(true);
  }

  cerrarArchivo() {
    this.fileModalOpen.set(false);
    this.fileSelected.set(null);
  }

  descargarArchivo() {
    const sel = this.fileSelected();
    if(sel) {
      const blob = new Blob([`Contenido de ${sel.file.name}`], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = sel.file.name; 
      document.body.appendChild(a); a.click(); 
      URL.revokeObjectURL(url); a.remove();
    }
  }
}
