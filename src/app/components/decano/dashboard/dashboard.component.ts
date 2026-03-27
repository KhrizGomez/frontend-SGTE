import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TramitesService } from '../../../services/decano/tramites.service';
import { SolicitudDetalleResponse } from '../../../models/decano/tramite-detalle.model';

@Component({
  selector: 'app-decano-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DecanoDashboardComponent implements OnInit {
  solicitudes: SolicitudDetalleResponse[] = [];
  cargando = true;

  stats = { pendientes: 0, enProceso: 0, finalizadas: 0, rechazadas: 0, total: 0 };
  donutGradient = 'conic-gradient(#e9ecef 0deg 360deg)';
  tramitesHoy: SolicitudDetalleResponse[] = [];

  constructor(private tramitesService: TramitesService, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.tramitesService.getSolicitudesPorRol('decano').subscribe({
      next: (data) => {
        this.solicitudes = data;
        this.calcularStats();
        this.calcularDonut();
        this.calcularTramitesHoy();
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
      pendientes: all.filter(s => s.estadoActual === 'pendiente').length,
      enProceso: all.filter(s => s.estadoActual === 'en_proceso').length,
      finalizadas: all.filter(s => s.estadoActual === 'finalizado').length,
      rechazadas: all.filter(s => s.estadoActual === 'rechazado').length,
      total: all.length,
    };
  }

  private calcularDonut(): void {
    const t = this.stats.total || 1;
    const pPend = (this.stats.pendientes / t) * 360;
    const pFin = (this.stats.finalizadas / t) * 360;
    const pRech = (this.stats.rechazadas / t) * 360;
    const pProc = 360 - pPend - pFin - pRech;

    let a = 0;
    const seg = (color: string, deg: number) => {
      const start = a;
      a += deg;
      return `${color} ${start}deg ${a}deg`;
    };

    this.donutGradient = `conic-gradient(${seg('#d97706', pPend)}, ${seg('#0f6a1d', pFin)}, ${seg('#dc2626', pRech)}, ${seg('#6c757d', pProc)})`;
  }

  private calcularTramitesHoy(): void {
    const hoy = new Date().toISOString().slice(0, 10);
    this.tramitesHoy = this.solicitudes
      .filter(s => s.fechaCreacion?.startsWith(hoy))
      .slice(0, 5);
  }

  formatearHora(fecha: string | null): string {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
