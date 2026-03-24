import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/general/autenticacion.service';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { LoadingService } from '../../../services/general/loading.service';
import { PlantillaCarrera } from '../../../models/coordinador/tramite-detalle.model';
import { LoadingComponent } from '../../shared/loading/loading.component';

@Component({
  selector: 'app-estudiante-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingComponent],
  templateUrl: './solicitudes.component.html',
  styleUrls: ['./solicitudes.component.css'],
})
export class EstudianteSolicitudes implements OnInit {

  plantillas: PlantillaCarrera[] = [];
  cargando = false;
  error = '';

  buscar = '';
  filtrCategoria = '';

  modalAbierto = false;
  plantillaSeleccionada: PlantillaCarrera | null = null;
  observaciones = '';

  constructor(
    private tramitesService: TramitesService,
    private authService: AutenticacionService,
    private loadingService: LoadingService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarPlantillasDisponibles();
  }

  cargarPlantillasDisponibles(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario?.idCarrera) {
      this.error = 'No se pudo obtener la carrera del usuario.';
      return;
    }

    this.cargando = true;
    this.error = '';
    this.cdr.detectChanges();

    const peticion$ = this.tramitesService.getPlantillasPorCarrera(usuario.idCarrera);

    this.loadingService.withMinDuration(peticion$).subscribe({
      next: (data) => {
        // Un estudiante sÃ³lo deberÃ­a ver las plantillas activas que puede solicitar
        this.plantillas = data.filter(p => p.estaActivo);
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Error al cargar los trÃ¡mites disponibles. Intente nuevamente.';
        this.cargando = false;
        this.cdr.detectChanges();
      },
    });
  }

  get plantillasFiltradas(): PlantillaCarrera[] {
    const q = this.buscar.trim().toLowerCase();
    return this.plantillas.filter(p => {
      const textoOk = !q || p.nombrePlantilla.toLowerCase().includes(q) ||
                      p.categoria.toLowerCase().includes(q) ||
                      p.nombreFlujo.toLowerCase().includes(q);
      const catOk = !this.filtrCategoria || p.categoria === this.filtrCategoria;
      return textoOk && catOk;
    });
  }

  get categorias(): string[] {
    return [...new Set(this.plantillas.map(p => p.categoria))];
  }

  get totalDisponibles(): number {
    return this.plantillas.length;
  }

  limpiarFiltros(): void {
    this.buscar = '';
    this.filtrCategoria = '';
  }

  abrirDetalle(plantilla: PlantillaCarrera): void {
    this.plantillaSeleccionada = plantilla;
    this.observaciones = '';
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.plantillaSeleccionada = null;
    this.observaciones = '';
  }

  enviarSolicitud(): void {
    // Simula el envÃ­o
    console.log('Enviando solicitud', this.plantillaSeleccionada, this.observaciones);
    this.cerrarModal();
  }
}
