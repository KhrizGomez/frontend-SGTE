import {Component, OnInit, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AutenticacionService} from '../../../services/autenticacion.service';
import {AutenticacionRespuesta} from '../../../models/general/autenticacion.model';

@Component({
    selector: 'app-coordinador-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './coordinador-layout.component.html',
    styleUrl: './coordinador-layout.component.css',
    encapsulation: ViewEncapsulation.None
})
export class CoordinadorLayoutComponent implements OnInit, AfterViewInit {
    usuarioActual: AutenticacionRespuesta | null = null;

    constructor(private autenticacionService: AutenticacionService) {}

    ngOnInit() {
        this.usuarioActual = this.autenticacionService.obtenerUsuarioActual();
    }

    ngAfterViewInit(): void {
        const pushContainer = document.getElementById('push');
        function pushNotification(title: string, msg: string, id?: string){
          if(!pushContainer) return;
          const toast = document.createElement('div');
          toast.className = 'push-toast';
          toast.innerHTML = `<strong>${title}</strong><div>${msg}</div>`;
          toast.addEventListener('click', ()=> {
            if(id) {
              const sb = document.getElementById('status');
              if(sb) { sb.textContent='Abriendo: ' + id; sb.className='status success'; sb.hidden=false; setTimeout(()=>sb.hidden=true, 2600); }
              window.location.href = '/coordinacion/solicitudes';
            }
            toast.remove();
          });
          pushContainer.appendChild(toast);
          setTimeout(()=> { if(toast.parentNode) toast.remove(); }, 5000);
        }

        if (!sessionStorage.getItem('demoPushShown')) {
          setTimeout(()=>{
            pushNotification('Nuevo trámite', 'Juan Pérez ha solicitado Cambio de carrera', 'C-2111');
            sessionStorage.setItem('demoPushShown', 'true');
          }, 8000);
        }
    }

    getNombre(){
        return `${this.usuarioActual?.nombres?.split(' ', 1) ?? ''} ${this.usuarioActual?.apellidos?.split(' ', 1) ?? ''}`;
    }

    getRol(){
        return this.usuarioActual?.rol;
    }

    getIniciales(){
        return `${this.usuarioActual?.nombres?.substring(0, 1) ?? ''}${this.usuarioActual?.apellidos?.substring(0, 1) ?? ''}`;
    }

    cerrarSesion() {
        this.autenticacionService.cerrarSesion();
        window.location.href = '/login'; // Or use Router to navigate
    }
}
