import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AutenticacionService } from '../../../services/autenticacion.service';
import { TramitesService } from '../../../services/tramites.service';
import { PlantillaCarrera } from '../../../models/tramite-detalle.model';

@Component({
  selector: 'app-plantillas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './plantillas.html',
  styleUrl: './plantillas.css',
})
export class Plantillas implements OnInit {

  plantillas: PlantillaCarrera[] = [];
  cargando = false;
  error = '';

  buscar = '';
  filtrCategoria = '';
  filtrActivo = '';

  modalAbierto = false;
  plantillaSeleccionada: PlantillaCarrera | null = null;

  constructor(
    private tramitesService: TramitesService,
    private authService: AutenticacionService,
  ) {}

  ngOnInit(): void {
    this.cargarPlantillas();
  }

  cargarPlantillas(): void {
    const usuario = this.authService.obtenerUsuarioActual();
    if (!usuario?.idCarrera) {
      this.error = 'No se pudo obtener la carrera del usuario.';
      return;
    }

    this.cargando = true;
    this.error = '';

    this.tramitesService.getPlantillasPorCarrera(usuario.idCarrera).subscribe({
      next: (data) => {
        this.plantillas = data;
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar las plantillas. Intente nuevamente.';
        this.cargando = false;
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
      const activoOk = this.filtrActivo === ''
        ? true
        : this.filtrActivo === 'activo' ? p.estaActivo : !p.estaActivo;
      return textoOk && catOk && activoOk;
    });
  }

  get categorias(): string[] {
    return [...new Set(this.plantillas.map(p => p.categoria))];
  }

  limpiarFiltros(): void {
    this.buscar = '';
    this.filtrCategoria = '';
    this.filtrActivo = '';
  }

  abrirDetalle(plantilla: PlantillaCarrera): void {
    this.plantillaSeleccionada = plantilla;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.plantillaSeleccionada = null;
  }
}
