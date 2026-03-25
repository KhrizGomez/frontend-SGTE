import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitudes.html',
  styleUrls: ['./solicitudes.css']
})
export class Solicitudes {
  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 5;

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

  tramites = signal<Tramite[]>([
    { id:'C-2101', titulo:'Cambio de carrera - Juan Pérez', estudiante:'Juan Pérez', tipo:'Cambio de carrera', prioridad:'Alta', estado:'En revisión', creado:'2025-09-02', actualizado:'2025-09-04', files:[ {name:'Solicitud.pdf', size:'120 KB'}, {name:'HistorialAcademico.pdf', size:'340 KB'} ], steps: this.flowMap.validacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-02': null, done: idx<1? '2025-09-03': null })), current: 1 },
    { id:'C-2102', titulo:'Homologación de materias - María López', estudiante:'María López', tipo:'Homologación', prioridad:'Urgente', estado:'Evaluación requerida', creado:'2025-09-01', actualizado:'2025-09-05', files:[ {name:'Programas.pdf', size:'1.2 MB'} ], steps: this.flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-01': null, done: idx<2? (idx===0? '2025-09-02':'2025-09-04') : null })), current: 2 },
    { id:'C-2103', titulo:'Certificado de matrícula - Carlos Ruiz', estudiante:'Carlos Ruiz', tipo:'Certificados', prioridad:'Media', estado:'Pendiente', creado:'2025-09-03', actualizado:'2025-09-03', files:[ {name:'Comprobante.pdf', size:'85 KB'} ], steps: this.flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-03': null, done: idx<1? '2025-09-03' : null })), current: 1 },
    { id:'C-2104', titulo:'Anulación de matrícula - Ana Torres', estudiante:'Ana Torres', tipo:'Anulación', prioridad:'Alta', estado:'Rechazado', creado:'2025-08-20', actualizado:'2025-08-23', files:[], steps: this.flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-08-20': null, done: idx===0? '2025-08-21' : null })), current: 99 },
    { id:'C-2105', titulo:'Justificación inasistencia - Luis Silva', estudiante:'Luis Silva', tipo:'Justificación', prioridad:'Baja', estado:'Finalizado', creado:'2025-08-10', actualizado:'2025-08-15', files:[ {name:'Certmedico.pdf', size:'400 KB'} ], steps: this.flowMap.basico.map((s)=>({ ...s, started: '2025-08-10', done: '2025-08-14' })), current: 100 },
    { id:'C-2106', titulo:'Cambio de periodo - Pedro Páez', estudiante:'Pedro Páez', tipo:'Cambio de periodo', prioridad:'Media', estado:'Pendiente', creado:'2025-09-04', actualizado:'2025-09-04', files:[], steps: this.flowMap.basico.map((s,idx)=>({ ...s, started: idx===0? '2025-09-04': null, done: idx<1? '2025-09-04' : null })), current: 1 },
    { id:'C-2107', titulo:'Homologación de materias - Sara León', estudiante:'Sara León', tipo:'Homologación', prioridad:'Media', estado:'Evaluación requerida', creado:'2025-09-05', actualizado:'2025-09-06', files:[ {name:'Syllabus.pdf', size:'3.1 MB'} ], steps: this.flowMap.homologacion.map((s,idx)=>({ ...s, started: idx===0? '2025-09-05': null, done: idx<2? (idx===0? '2025-09-05':'2025-09-06') : null })), current: 2 }
  ]);

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
          t.estado = `En progreso (Paso ${t.current + 1})`;
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
