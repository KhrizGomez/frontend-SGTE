import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { switchMap } from 'rxjs';
import { AutenticacionService } from '../../../services/general/autenticacion.service';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { ToastService } from '../../../services/general/toast.service';
import { CategoriaTramite, FlujoTramite, PasoTramite, PlantillaCarrera, GuardarPlantillaPayload, PasoNuevoPlantilla, NuevaPlantillaForm, EtapaTramite, UsuarioAsignableTramite, GuardarFlujoCompletoPayload } from '../../../models/coordinador/plantilla.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './plantillas.html',
  styleUrl: './plantillas.css'
})
export class Plantillas implements OnInit {
  modoFlujo = signal<'disponibles' | 'personalizado' | null>(null);
  plantillas = signal<PlantillaCarrera[]>([]);
  categoriasActivas = signal<CategoriaTramite[]>([]);
  usuariosAsignables = signal<UsuarioAsignableTramite[]>([]);
  etapasDisponibles = signal<EtapaTramite[]>([]);
  flujosDisponibles = signal<FlujoTramite[]>([]);
  flujoVistaPrevia = signal<FlujoTramite | null>(null);
  cargando = signal(false);
  cargandoFlujos = signal(false);
  cargandoCategorias = signal(false);
  cargandoUsuarios = signal(false);
  cargandoEtapas = signal(false);
  mostrarConstructorFlujo = signal(false);
  error = signal('');
  showNuevaPlantillaModal = signal(false);
  showDetalleModal = signal(false);
  showConfirmEliminarModal = signal(false);
  currentEditId = signal<number | null>(null);

  esEdicion = computed(() => this.currentEditId() !== null);

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
        idRolRequerido: null,
        rolRequerido: '',
        idUsuarioEncargado: null,
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
    this.cargarUsuariosAsignables();
    this.cargarEtapasDisponibles();
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

  eliminarPlantillaSeleccionada(): void {
    const plantilla = this.plantillaSeleccionada();
    if (!plantilla) {
      return;
    }

    this.showConfirmEliminarModal.set(true);
  }

  cerrarConfirmarEliminarPlantilla(): void {
    this.showConfirmEliminarModal.set(false);
  }

  confirmarEliminarPlantilla(): void {
    const plantilla = this.plantillaSeleccionada();
    if (!plantilla) {
      this.cerrarConfirmarEliminarPlantilla();
      return;
    }

    this.loadingService.withMinDuration(this.tramitesService.eliminarPlantilla(plantilla.idPlantilla)).subscribe({
      next: () => {
        this.toastService.show('Plantilla eliminada', 'La plantilla se eliminó correctamente.', 'success');
        this.cerrarConfirmarEliminarPlantilla();
        this.showDetalleModal.set(false);
        this.plantillaSeleccionada.set(null);
        this.cargarPlantillas();
      },
      error: () => {
        this.cerrarConfirmarEliminarPlantilla();
        this.error.set('No se pudo eliminar la plantilla. Intenta nuevamente.');
      }
    });
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
    this.modoFlujo.set('disponibles');
    this.mostrarConstructorFlujo.set(false);
    this.seleccionarFlujoId(seleccionada.idFlujo || null);
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
    this.modoFlujo.set(null);
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
    this.modoFlujo.set('disponibles');
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
    this.modoFlujo.set('personalizado');
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

  mostrarFlujosDisponibles(): void {
    this.modoFlujo.set('disponibles');
    this.mostrarConstructorFlujo.set(false);
  }

  mostrarFlujoPersonalizado(): void {
    if (this.esEdicion()) {
      return;
    }

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

  seleccionarUsuarioAsignado(indice: number, idUsuario: number): void {
    const usuario = this.usuariosAsignables().find(item => item.idUsuario === idUsuario);
    if (!usuario) {
      return;
    }

    const nombreCompleto = `${usuario.nombres} ${usuario.apellidos}`.trim();

    this.nuevaPlantilla.update(actual => ({
      ...actual,
      pasos: actual.pasos.map((paso, index) => index === indice
        ? {
            ...paso,
            usuarioEncargado: nombreCompleto,
            idUsuarioEncargado: usuario.idUsuario,
            idRolRequerido: usuario.idRol,
            rolRequerido: usuario.rol || paso.rolRequerido
          }
        : paso)
    }));
  }

  seleccionarEtapaDisponible(indice: number, idEtapa: number | null): void {
    const etapa = this.etapasDisponibles().find(item => item.idEtapa === Number(idEtapa));

    this.nuevaPlantilla.update(actual => ({
      ...actual,
      pasos: actual.pasos.map((paso, index) => {
        if (index !== indice) {
          return paso;
        }

        if (!etapa) {
          return {
            ...paso,
            idEtapa: null,
            codigoEtapa: '',
            nombreEtapa: '',
            descripcionEtapa: ''
          };
        }

        return {
          ...paso,
          idEtapa: etapa.idEtapa,
          codigoEtapa: etapa.codigoEtapa,
          nombreEtapa: etapa.nombreEtapa,
          descripcionEtapa: etapa.descripcionEtapa
        };
      })
    }));
  }

  crearPlantilla(): void {
    const formulario = this.nuevaPlantilla();
    const usuario = this.authService.obtenerUsuarioActual();
    const nombrePlantilla = formulario.nombrePlantilla.trim();
    const descripcionPlantilla = formulario.descripcionPlantilla.trim();
    const idCarrera = usuario?.idCarrera;
    const esFlujoPersonalizado = this.modoFlujo() === 'personalizado';
    const idPlantillaEditando = this.currentEditId();

    if (!nombrePlantilla || !formulario.idCategoria || !idCarrera) {
      this.error.set('');
      this.toastService.show(
        'Datos incompletos',
        esFlujoPersonalizado
          ? 'Completa el nombre, la categoría, la carrera del usuario y define el flujo personalizado.'
          : 'Completa el nombre de la plantilla, la categoría, selecciona un flujo y verifica la carrera del usuario.',
        'warning'
      );
      return;
    }

    if (esFlujoPersonalizado) {
      const pasosInvalidos = formulario.pasos.some((paso) => {
        const usaEtapaNueva = paso.idEtapa === null;
        const etapaNuevaIncompleta = usaEtapaNueva && (!paso.nombreEtapa.trim() || !paso.codigoEtapa.trim() || !paso.descripcionEtapa.trim());
        const asignacionIncompleta = !paso.idRolRequerido || !paso.idUsuarioEncargado || Number(paso.horasSla) <= 0;

        return etapaNuevaIncompleta || asignacionIncompleta;
      });

      if (pasosInvalidos) {
        this.error.set('');
        this.toastService.show(
          'Pasos incompletos',
          'Completa cada paso con su etapa, rol, usuario y horas SLA antes de guardar el flujo personalizado.',
          'warning'
        );
        return;
      }
    }

    const guardarPlantillaConFlujo = (idFlujo: number) => {
      const payload: GuardarPlantillaPayload = {
        nombrePlantilla,
        descripcionPlantilla,
        idCategoria: formulario.idCategoria,
        idCarrera,
        idFlujo,
        diasEstimados: Number(formulario.diasResolucionEstimados) || 0,
        estaActivo: formulario.estaActivo,
        disponibleExternos: formulario.disponibleExternos
      };

      return this.tramitesService.guardarPlantilla(payload);
    };

    const guardarPlantillaEditada = (idFlujo: number) => {
      if (!idPlantillaEditando) {
        return this.tramitesService.guardarPlantilla({
          nombrePlantilla,
          descripcionPlantilla,
          idCategoria: formulario.idCategoria,
          idCarrera,
          idFlujo,
          diasEstimados: Number(formulario.diasResolucionEstimados) || 0,
          estaActivo: formulario.estaActivo,
          disponibleExternos: formulario.disponibleExternos
        });
      }

      return this.tramitesService.editarPlantilla(idPlantillaEditando, {
        nombrePlantilla,
        descripcionPlantilla,
        idCategoria: formulario.idCategoria,
        idCarrera,
        idFlujo,
        diasEstimados: Number(formulario.diasResolucionEstimados) || 0,
        estaActivo: formulario.estaActivo,
        disponibleExternos: formulario.disponibleExternos
      });
    };

    if (esFlujoPersonalizado) {
      const flujoPayload: GuardarFlujoCompletoPayload = {
        nombreFlujo: nombrePlantilla,
        descripcionFlujo: descripcionPlantilla,
        estaActivo: formulario.estaActivo,
        version: 1,
        creadoPorId: usuario?.idUsuario ?? 0,
        pasos: formulario.pasos.map((paso, index) => ({
          ordenPaso: index + 1,
          rolRequeridoId: paso.idRolRequerido,
          idUsuarioEncargado: paso.idUsuarioEncargado,
          horasSla: Number(paso.horasSla) || 0,
          ...(paso.idEtapa
            ? { idEtapa: paso.idEtapa }
            : {
                etapa: {
                  nombreEtapa: paso.nombreEtapa.trim(),
                  descripcionEtapa: paso.descripcionEtapa.trim(),
                  codigoEtapa: paso.codigoEtapa.trim()
                }
              })
        }))
      };

      const guardarCompleto$ = this.tramitesService.guardarFlujoCompleto(flujoPayload).pipe(
        switchMap((respuesta) => {
          const idFlujoCreado = respuesta?.idFlujo ?? 0;

          if (!idFlujoCreado) {
            throw new Error('No se recibió el identificador del flujo creado.');
          }

          return idPlantillaEditando ? guardarPlantillaEditada(idFlujoCreado) : guardarPlantillaConFlujo(idFlujoCreado);
        })
      );

      this.loadingService.withMinDuration(guardarCompleto$).subscribe({
        next: () => {
          this.toastService.show('Plantilla guardada', 'El flujo y la plantilla se guardaron correctamente.', 'success');
          this.cerrarNuevaPlantilla();
          this.cargarPlantillas();
          this.cargarFlujosDisponibles();
          this.cargarEtapasDisponibles();
          this.error.set('');
        },
        error: () => {
          this.error.set('No se pudo guardar el flujo personalizado. Intenta nuevamente.');
        }
      });

      return;
    }

    if (!this.flujoVistaPrevia()?.idFlujo) {
      this.error.set('');
      this.toastService.show(
        'Datos incompletos',
        idPlantillaEditando
          ? 'Selecciona un flujo ya creado antes de guardar los cambios.'
          : 'Selecciona un flujo disponible antes de guardar la plantilla.',
        'warning'
      );
      return;
    }

    const idFlujoSeleccionado = formulario.flujoSeleccionadoId ?? this.flujoVistaPrevia()?.idFlujo ?? null;

    if (!idFlujoSeleccionado) {
      this.error.set('');
      this.toastService.show(
        'Datos incompletos',
        'Selecciona un flujo ya creado para poder guardar.',
        'warning'
      );
      return;
    }

    const payload: GuardarPlantillaPayload = {
      nombrePlantilla,
      descripcionPlantilla,
      idCategoria: formulario.idCategoria,
      idCarrera,
      idFlujo: idFlujoSeleccionado,
      diasEstimados: Number(formulario.diasResolucionEstimados) || 0,
      estaActivo: formulario.estaActivo,
      disponibleExternos: formulario.disponibleExternos
    };

    const peticion$ = idPlantillaEditando
      ? this.tramitesService.editarPlantilla(idPlantillaEditando, payload)
      : this.tramitesService.guardarPlantilla(payload);

    this.loadingService.withMinDuration(peticion$).subscribe({
      next: () => {
        this.toastService.show(
          idPlantillaEditando ? 'Cambios guardados' : 'Plantilla guardada',
          idPlantillaEditando ? 'La plantilla se actualizó correctamente.' : 'La plantilla se guardó correctamente.',
          'success'
        );
        this.cerrarNuevaPlantilla();
        this.cargarPlantillas();
        this.cargarFlujosDisponibles();
        this.cargarEtapasDisponibles();
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
      idRolRequerido: null,
      rolRequerido: '',
      idUsuarioEncargado: null,
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
      idRolRequerido: paso.idRolRequerido ?? null,
      rolRequerido: paso.rolRequerido || '',
      idUsuarioEncargado: paso.idUsuarioEncargado ?? null,
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
      idRolRequerido: paso.idRolRequerido,
      rolRequerido: paso.rolRequerido.trim() || null,
      idUsuarioEncargado: paso.idUsuarioEncargado,
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
      idRolRequerido: paso.idRolRequerido,
      rolRequerido: paso.rolRequerido.trim() || null,
      idUsuarioEncargado: paso.idUsuarioEncargado,
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

  cargarEtapasDisponibles(): void {
    this.cargandoEtapas.set(true);

    this.tramitesService.getEtapas().subscribe({
      next: (etapas) => {
        this.etapasDisponibles.set(etapas);
        this.cargandoEtapas.set(false);
      },
      error: () => {
        this.cargandoEtapas.set(false);
        this.toastService.show('Etapas no disponibles', 'No se pudieron cargar las etapas. Puedes crear una nueva manualmente.', 'warning');
      }
    });
  }

  cargarUsuariosAsignables(): void {
    this.cargandoUsuarios.set(true);

    this.tramitesService.getUsuariosAsignables().subscribe({
      next: (usuarios) => {
        this.usuariosAsignables.set(usuarios);
        this.cargandoUsuarios.set(false);
      },
      error: () => {
        this.cargandoUsuarios.set(false);
        this.toastService.show('Usuarios no disponibles', 'No se pudieron cargar los usuarios para asignar etapas.', 'warning');
      }
    });
  }

  esDecano(usuario: UsuarioAsignableTramite): boolean {
    return usuario.idRol === 1 || (usuario.rol || '').trim().toLowerCase() === 'decano';
  }

  esCoordinador(usuario: UsuarioAsignableTramite): boolean {
    return usuario.idRol === 3 || (usuario.rol || '').trim().toLowerCase() === 'coordinador';
  }

  obtenerAlcanceUsuario(usuario: UsuarioAsignableTramite): string {
    if (this.esDecano(usuario)) {
      return usuario.facultad || usuario.carrera || 'Sin facultad';
    }

    if (this.esCoordinador(usuario)) {
      return usuario.carrera || usuario.facultad || 'Sin carrera';
    }

    return usuario.facultad || usuario.carrera || 'Sin asignación';
  }
}
