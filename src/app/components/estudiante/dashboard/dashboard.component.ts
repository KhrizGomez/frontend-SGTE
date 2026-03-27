import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TramitesService } from '../../../services/coordinador/tramites.service';
import { SolicitudDetalleResponse } from '../../../models/coordinador/plantilla.model';

@Component({
  selector: 'app-estudiante-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class EstudianteDashboard implements OnInit {
  solicitudes: SolicitudDetalleResponse[] = [];
  cargando = true;

  stats = { enRevision: 0, finalizadas: 0, rechazadas: 0, total: 0 };
  donutGradient = 'conic-gradient(#e9ecef 0deg 360deg)';
  recientes: SolicitudDetalleResponse[] = [];

  constructor(private tramitesService: TramitesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.tramitesService.getMisSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.calcularStats();
        this.calcularDonut();
        this.obtenerRecientes();
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.cargando = false;
      }
    });
  }

  private calcularStats(): void {
    const all = this.solicitudes;
    this.stats = {
      enRevision: all.filter(s => s.estadoActual === 'pendiente' || s.estadoActual === 'en_proceso').length,
      finalizadas: all.filter(s => s.estadoActual === 'finalizado').length,
      rechazadas: all.filter(s => s.estadoActual === 'rechazado').length,
      total: all.length,
    };
  }

  private calcularDonut(): void {
    const t = this.stats.total || 1;
    const pRev = (this.stats.enRevision / t) * 360;
    const pFin = (this.stats.finalizadas / t) * 360;
    const pRech = 360 - pRev - pFin;

    let a = 0;
    const seg = (color: string, deg: number) => {
      const start = a;
      a += deg;
      return `${color} ${start}deg ${a}deg`;
    };

    this.donutGradient = `conic-gradient(${seg('#d97706', pRev)}, ${seg('#0f6a1d', pFin)}, ${seg('#dc2626', pRech)})`;
  }

  private obtenerRecientes(): void {
    this.recientes = [...this.solicitudes]
      .sort((a, b) => (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? ''))
      .slice(0, 3);
  }

  formatearFechaRelativa(fecha: string | null): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    const hoy = new Date();
    const diffMs = hoy.getTime() - d.getTime();
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDias === 0) return 'Hoy';
    if (diffDias === 1) return 'Ayer';
    if (diffDias < 7) return `Hace ${diffDias} días`;
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
  }
}
