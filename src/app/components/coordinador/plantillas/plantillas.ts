import { ChangeDetectorRef, Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/general/autenticacion.service';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { PlantillaCarrera } from '../../../models/coordinador/tramite-detalle.model';
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
  cargando = signal(false);
  error = signal('');

  buscar = signal('');
  paginaActual = signal(1);
  porPagina = 5;

  plantillaSeleccionada = signal<PlantillaCarrera | null>(null);

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
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarPlantillas();
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
}
