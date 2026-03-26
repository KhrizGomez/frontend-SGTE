import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/general/autenticacion.service';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { ToastService } from '../../../services/general/toast.service';
import { CategoriaTramite, FlujoTramite, PasoTramite, PlantillaCarrera, GuardarPlantillaPayload, PasoNuevoPlantilla, NuevaPlantillaForm } from '../../../models/coordinador/plantilla.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './plantillas.html',
  styleUrl: './plantillas.css'
})
export class Plantillas implements OnInit {
  plantillas = signal<PlantillaCarrera[]>([]);
  categoriasActivas = signal<CategoriaTramite[]>([]);
  flujosDisponibles = signal<FlujoTramite[]>([]);
  flujoVistaPrevia = signal<FlujoTramite | null>(null);
  cargando = signal(false);
  cargandoFlujos = signal(false);
  cargandoCategorias = signal(false);
  mostrarConstructorFlujo = signal(false);
  error = signal('');
  showNuevaPlantillaModal = signal(false);
  showDetalleModal = signal(false);
  currentEditId = signal<number | null>(null);

  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 8;

  plantillaSeleccionada = signal<PlantillaCarrera | null>(null);
  nuevaPlantilla = signal<NuevaPlantillaForm>({
    nombrePlantilla: '',
    idCategoria: null,
    categoria: '',
    flujoSeleccionadoId: null,
    descripcionPlantilla: '',
    diasResolucionEstimados: null,
    disponibleExternos: false,
    estaActivo: true,
    pasos: [
      {
        idPaso: 1,
        ordenPaso: 1,
        idEtapa: null,
        codigoEtapa: '',
        nombreEtapa: '',
        descripcionEtapa: '',
        rolRequerido: '',
        usuarioEncargado: '',
        horasSla: 0
      }
    ]
  });

  categoriasDisponibles = computed(() => {
    const categorias = new Set<string>();

    for (const plantilla of this.plantillas()) {
      const categoria = (plantilla.categoria || '').trim();
      if (categoria) {
        categorias.add(categoria);
      }
    }

    return Array.from(categorias).sort((a, b) => a.localeCompare(b));
  });

  flujoSeleccionado = computed(() => {
    const idFlujo = this.nuevaPlantilla().flujoSeleccionadoId;
    if (!idFlujo) {
      return null;
    }

    return this.flujosDisponibles().find(flujo => flujo.idFlujo === idFlujo) ?? null;
  });

  categoriaSeleccionada = computed(() => {
    const idCategoria = this.nuevaPlantilla().idCategoria;
    if (!idCategoria) {
      return null;
    }

    return this.categoriasActivas().find(categoria => categoria.idCategoria === idCategoria) ?? null;
  });

  vistaPreviaFlujo = computed(() => {
    const flujo = this.flujoVistaPrevia();
    if (flujo) {
      return flujo;
    }

    const formulario = this.nuevaPlantilla();
    return {
      idFlujo: 0,
      nombreFlujo: 'Flujo asociado pendiente',
      descripcionFlujo: formulario.descripcionPlantilla.trim() || 'Diseña las etapas y responsables de tu flujo.',
      categoria: formulario.categoria.trim() || 'Sin categoría',
      estaActivo: formulario.estaActivo,
      version: 1,
      creadoPor: null,
      pasos: formulario.pasos.map((paso, index) => this.formularioAPasoFlujo(paso, index))
    } satisfies FlujoTramite;
  });

  stats = computed(() => {
    const all = this.plantillas();
    return {
      activas: all.filter(p => p.estaActivo).length,
      inactivas: all.filter(p => !p.estaActivo).length,
      externos: all.filter(p => p.disponibleExternos).length,
      total: all.length
    };
  });

  plantillasFiltradas = computed(() => {
    const q = this.buscar().trim().toLowerCase();
    return this.plantillas().filter(p => {
      return !q || 
             (p.nombrePlantilla || '').toLowerCase().includes(q) ||
             (p.categoria || '').toLowerCase().includes(q) ||
             (p.nombreFlujo || '').toLowerCase().includes(q);
    });
  });

  paginacion = computed(() => {
    const total = this.plantillasFiltradas().length;
    const maxPagina = Math.ceil(total / this.porPagina) || 1;
    let actual = this.paginaActual();
    if(actual > maxPagina) actual = maxPagina;
    
    const inicio = (actual - 1) * this.porPagina;
    const items = this.plantillasFiltradas().slice(inicio, inicio + this.porPagina);
    return { items, actual, maxPagina, total };
  });

  constructor(
    private tramitesService: TramitesService,
    private authService: AutenticacionService,
    private loadingService: LoadingService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.cargarPlantillas();
    this.cargarFlujosDisponibles();
    this.cargarCategoriasActivas();
  }



  cambiarPagina(dir: number) {
    const nueva = this.paginaActual() + dir;
    const m = Math.ceil(this.plantillasFiltradas().length / this.porPagina);
    if(nueva >= 1 && nueva <= m) {
      this.paginaActual.set(nueva);
    }
  }

  seleccionarPlantilla(p: PlantillaCarrera): void {
    this.plantillaSeleccionada.set(p);
  }

  abrirDetallePlantilla(p: PlantillaCarrera): void {
    this.plantillaSeleccionada.set(p);
    this.showNuevaPlantillaModal.set(false);
    this.error.set('');
    this.showDetalleModal.set(true);
  }

  cerrarDetallePlantilla(): void {
    this.showDetalleModal.set(false);
  }

  abrirEdicionPlantilla(): void {
    const seleccionada = this.plantillaSeleccionada();
    if (!seleccionada) {
      return;
    }

    const pasos = seleccionada.pasosTramite.length
      ? seleccionada.pasosTramite.map((paso, index) => this.pasoTramiteAFormulario(paso, index))
      : [this.crearPasoVacio(1)];

    this.currentEditId.set(seleccionada.idPlantilla);
    this.nuevaPlantilla.set({
      nombrePlantilla: seleccionada.nombrePlantilla,
      idCategoria: seleccionada.idCategoria || null,
      categoria: seleccionada.categoria,
      flujoSeleccionadoId: seleccionada.idFlujo || null,
      descripcionPlantilla: seleccionada.descripcionPlantilla,
      diasResolucionEstimados: seleccionada.diasResolucionEstimados,
      disponibleExternos: seleccionada.disponibleExternos,
      estaActivo: seleccionada.estaActivo,
      pasos
    });
    this.error.set('');
    this.showDetalleModal.set(false);
    this.showNuevaPlantillaModal.set(true);
  }

  abrirNuevaPlantilla(): void {
    this.currentEditId.set(null);
    this.nuevaPlantilla.set({
      nombrePlantilla: '',
      idCategoria: null,
      categoria: '',
      flujoSeleccionadoId: null,
      descripcionPlantilla: '',
      diasResolucionEstimados: null,
      disponibleExternos: false,
      estaActivo: true,
      pasos: [this.crearPasoVacio(1)]
    });
    this.flujoVistaPrevia.set(null);
    this.mostrarConstructorFlujo.set(false);
    this.error.set('');
    this.showNuevaPlantillaModal.set(true);
  }

  cerrarNuevaPlantilla(): void {
    this.showNuevaPlantillaModal.set(false);
    this.currentEditId.set(null);
  }

  actualizarNuevaPlantilla(campo: keyof NuevaPlantillaForm, valor: string | number | boolean): void {
    this.nuevaPlantilla.update(actual => {
      const siguiente = {
        ...actual,
        [campo]: valor
      } as NuevaPlantillaForm;

      if (campo === 'idCategoria') {
        const categoria = this.categoriasActivas().find(item => item.idCategoria === Number(valor));
        siguiente.categoria = categoria?.nombreCategoria ?? '';
      }

      return siguiente;
    });
  }

  verFlujoDisponible(flujo: FlujoTramite): void {
    this.flujoVistaPrevia.set(flujo);
    this.mostrarConstructorFlujo.set(false);
    this.nuevaPlantilla.update(actual => ({
      ...actual,
      flujoSeleccionadoId: flujo.idFlujo
    }));
  }

  seleccionarFlujoId(idFlujo: number | null): void {
    const flujo = this.flujosDisponibles().find(item => item.idFlujo === idFlujo) ?? null;
    this.nuevaPlantilla.update(actual => ({
      ...actual,
      flujoSeleccionadoId: idFlujo
    }));
    this.flujoVistaPrevia.set(flujo);
    if (!flujo) {
      this.mostrarConstructorFlujo.set(false);
    }
  }

  abrirConstructorFlujo(): void {
    this.mostrarConstructorFlujo.set(true);
    this.nuevaPlantilla.update(actual => ({
      ...actual,
      flujoSeleccionadoId: null,
      pasos: [this.crearPasoVacio(1)]
    }));
    this.flujoVistaPrevia.set(null);
  }

  restablecerFlujoPersonalizado(): void {
    this.abrirConstructorFlujo();
  }

  agregarPaso(): void {
    this.nuevaPlantilla.update(actual => ({
      ...actual,
      pasos: [...actual.pasos, this.crearPasoVacio(actual.pasos.length + 1)]
    }));
  }

  eliminarPaso(indice: number): void {
    this.nuevaPlantilla.update(actual => {
      const pasos = actual.pasos.filter((_, index) => index !== indice);
      const normalizados = pasos.length ? pasos : [this.crearPasoVacio(1)];

      return {
        ...actual,
        pasos: normalizados.map((paso, index) => ({
          ...paso,
          ordenPaso: index + 1
        }))
      };
    });
  }

  actualizarPaso(indice: number, campo: keyof PasoNuevoPlantilla, valor: string | number): void {
    this.nuevaPlantilla.update(actual => ({
      ...actual,
      pasos: actual.pasos.map((paso, index) => index === indice ? { ...paso, [campo]: valor } as PasoNuevoPlantilla : paso)
    }));
  }

  crearPlantilla(): void {
    const formulario = this.nuevaPlantilla();
    const usuario = this.authService.obtenerUsuarioActual();
    const nombrePlantilla = formulario.nombrePlantilla.trim();
    const descripcionPlantilla = formulario.descripcionPlantilla.trim();
    const idCarrera = usuario?.idCarrera;

    if (!nombrePlantilla || !formulario.idCategoria || !this.flujoVistaPrevia()?.idFlujo || !idCarrera) {
      this.error.set('Completa el nombre de la plantilla, la categoría, selecciona un flujo y verifica la carrera del usuario.');
      return;
    }

    const payload: GuardarPlantillaPayload = {
      nombrePlantilla,
      descripcionPlantilla,
      idCategoria: formulario.idCategoria,
      idCarrera,
      idFlujo: formulario.flujoSeleccionadoId,
      diasEstimados: Number(formulario.diasResolucionEstimados) || 0,
      estaActivo: formulario.estaActivo,
      disponibleExternos: formulario.disponibleExternos
    };

    this.loadingService.withMinDuration(this.tramitesService.guardarPlantilla(payload)).subscribe({
      next: () => {
        this.toastService.show('Plantilla guardada', 'La plantilla se guardó correctamente.', 'success');
        this.cerrarNuevaPlantilla();
        this.cargarPlantillas();
        this.error.set('');
      },
      error: () => {
        this.error.set('No se pudo guardar la plantilla. Intenta nuevamente.');
      }
    });
  }

  private crearPasoVacio(ordenPaso: number): PasoNuevoPlantilla {
    return {
      idPaso: Date.now() + ordenPaso,
      ordenPaso,
      idEtapa: null,
      codigoEtapa: '',
      nombreEtapa: '',
      descripcionEtapa: '',
      rolRequerido: '',
      usuarioEncargado: '',
      horasSla: 0
    };
  }

  private crearPasosVacios(cantidad: number): PasoNuevoPlantilla[] {
    return Array.from({ length: Math.max(1, cantidad) }, (_, index) => this.crearPasoVacio(index + 1));
  }

  private pasoTramiteAFormulario(paso: PasoTramite, index: number): PasoNuevoPlantilla {
    return {
      idPaso: paso.idPaso || Date.now() + index,
      ordenPaso: paso.ordenPaso || index + 1,
      idEtapa: paso.idEtapa ?? null,
      codigoEtapa: paso.codigoEtapa || `ETAPA-${index + 1}`,
      nombreEtapa: paso.nombreEtapa || `Etapa ${index + 1}`,
      descripcionEtapa: paso.descripcionEtapa || '',
      rolRequerido: paso.rolRequerido || '',
      usuarioEncargado: paso.usuarioEncargado || '',
      horasSla: paso.horasSla || 0
    };
  }

  private formularioAPasoTramite(paso: PasoNuevoPlantilla, index: number): PasoTramite {
    const ordenPaso = index + 1;

    return {
      idPaso: paso.idPaso || ordenPaso,
      idFlujo: this.nuevaPlantilla().flujoSeleccionadoId ?? 0,
      ordenPaso,
      idEtapa: paso.idEtapa ?? ordenPaso,
      codigoEtapa: paso.codigoEtapa.trim() || `ETAPA-${ordenPaso}`,
      nombreEtapa: paso.nombreEtapa.trim() || `Etapa ${ordenPaso}`,
      descripcionEtapa: paso.descripcionEtapa.trim(),
      idRolRequerido: null,
      rolRequerido: paso.rolRequerido.trim() || null,
      idUsuarioEncargado: null,
      usuarioEncargado: paso.usuarioEncargado.trim() || null,
      horasSla: Number(paso.horasSla) || 0
    };
  }

  private formularioAPasoFlujo(paso: PasoNuevoPlantilla, index: number): PasoTramite {
    return {
      idPaso: paso.idPaso || index + 1,
      idFlujo: 0,
      ordenPaso: index + 1,
      idEtapa: paso.idEtapa ?? index + 1,
      codigoEtapa: paso.codigoEtapa.trim(),
      nombreEtapa: paso.nombreEtapa.trim(),
      descripcionEtapa: paso.descripcionEtapa.trim(),
      idRolRequerido: null,
      rolRequerido: paso.rolRequerido.trim() || null,
      idUsuarioEncargado: null,
      usuarioEncargado: paso.usuarioEncargado.trim() || null,
      horasSla: Number(paso.horasSla) || 0
    };
  }

  cargarFlujosDisponibles(): void {
    this.cargandoFlujos.set(true);

    this.tramitesService.getFlujos().subscribe({
      next: (flujos) => {
        this.flujosDisponibles.set(flujos.filter(flujo => flujo.estaActivo));
        this.cargandoFlujos.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los flujos disponibles.');
        this.cargandoFlujos.set(false);
      }
    });
  }

  cargarPlantillas(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario?.idCarrera) {
      this.error.set('No se pudo obtener la carrera del usuario.');
      return;
    }

    this.cargando.set(true);
    this.error.set('');

    const peticion$ = this.tramitesService.getPlantillasPorCarrera(usuario.idCarrera);

    this.loadingService.withMinDuration(peticion$).subscribe({
      next: (data) => {
        this.plantillas.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('Error al cargar las plantillas. Intente nuevamente.');
        this.cargando.set(false);
      }
    });
  }

  cargarCategoriasActivas(): void {
    this.cargandoCategorias.set(true);

    this.tramitesService.getCategoriasActivas().subscribe({
      next: (categorias) => {
        this.categoriasActivas.set(categorias);
        this.cargandoCategorias.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las categorías activas.');
        this.cargandoCategorias.set(false);
      }
    });
  }
}
