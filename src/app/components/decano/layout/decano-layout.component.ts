import {Component, OnInit, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AutenticacionService } from '../../../services/general/autenticacion.service';
import {AutenticacionRespuesta} from '../../../models/general/autenticacion.model';
import {AiChatComponent} from '../../shared/ai-chat/ai-chat.component';
import {ChatbotConfig} from '../../../models/ai/chatbot.model';


@Component({
    selector: 'app-decano-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatComponent],
    templateUrl: './decano-layout.component.html',
    styleUrl: './decano-layout.component.css',
    encapsulation: ViewEncapsulation.None
})
export class DecanoLayoutComponent implements OnInit, AfterViewInit {
    usuarioActual: AutenticacionRespuesta | null = null;

    chatConfig: ChatbotConfig = {
        module: 'decano',
        title: 'Asistente SGTE',
        welcomeMessage: 'Â¡Hola! Soy el asistente del SGTE. Puedo ayudarte a gestionar trÃ¡mites, revisar solicitudes y consultar el estado del flujo de tu carrera.',
        quickActions: [
            { label: 'Solicitudes pendientes', prompt: 'Â¿CuÃ¡ntas solicitudes tengo pendientes de revisar?', icon: 'bi-clock-history' },
            { label: 'TrÃ¡mites disponibles', prompt: 'Â¿QuÃ© tipos de trÃ¡mites puedo gestionar como decano?', icon: 'bi-list-check' },
            { label: 'Plazos vigentes', prompt: 'Â¿Hay algÃºn trÃ¡mite prÃ³ximo a vencer o con plazo urgente?', icon: 'bi-calendar-event' },
            { label: 'CÃ³mo rechazar', prompt: 'Â¿CÃ³mo rechazo una solicitud y quÃ© debo indicar?', icon: 'bi-x-circle' },
        ],
    };

    constructor(private autenticacionService: AutenticacionService) {}

    ngOnInit() {
        this.usuarioActual = this.autenticacionService.obtenerUsuarioActual();
        this.chatConfig = {
            ...this.chatConfig,
            userId:    this.usuarioActual?.idUsuario,
            idCarrera: this.usuarioActual?.idCarrera,
        };
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
              window.location.href = '/decanato/solicitudes';
            }
            toast.remove();
          });
          pushContainer.appendChild(toast);
          setTimeout(()=> { if(toast.parentNode) toast.remove(); }, 5000);
        }

        if (!sessionStorage.getItem('demoPushShown')) {
          setTimeout(()=>{
            pushNotification('Nuevo trÃ¡mite', 'Juan PÃ©rez ha solicitado Cambio de carrera', 'C-2111');
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


