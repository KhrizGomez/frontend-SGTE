import {Component, OnInit, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { AutenticacionService } from '../../../services/general/autenticacion.service';
import { AutenticacionRespuesta} from '../../../models/general/autenticacion.model';
import { AiChatComponent } from '../../shared/ai-chat/ai-chat.component';
import { ChatbotConfig } from '../../../models/ai/chatbot.model';

@Component({
    selector: 'app-estudiante-layout',
    standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatComponent],
    templateUrl: './estudiante-layout.component.html',
    styleUrl: './estudiante-layout.component.css',
    encapsulation: ViewEncapsulation.None
})
export class EstudianteLayoutComponent implements OnInit, AfterViewInit {
    usuarioActual: AutenticacionRespuesta | null = null;

  chatConfig: ChatbotConfig = {
    module: 'estudiante',
    title: 'Asistente SGTE',
    welcomeMessage: 'Hola, soy tu asistente del SGTE. Te puedo ayudar con solicitudes, requisitos y seguimiento de tus tramites.',
    quickActions: [
      { label: 'Como crear solicitud', prompt: 'Como creo una solicitud nueva paso a paso?', icon: 'bi-plus-circle' },
      { label: 'Requisitos', prompt: 'Que requisitos necesito para homologacion y certificados?', icon: 'bi-list-check' },
      { label: 'Estado de tramite', prompt: 'Como reviso el estado y trazabilidad de un tramite?', icon: 'bi-search' },
      { label: 'Tiempos estimados', prompt: 'Cuanto demoran los tramites mas comunes?', icon: 'bi-clock-history' },
    ],
  };

    constructor(private autenticacionService: AutenticacionService) {}

    ngOnInit() {
        this.usuarioActual = this.autenticacionService.obtenerUsuarioActual();
      this.chatConfig = {
        ...this.chatConfig,
        userId: this.usuarioActual?.idUsuario,
        idCarrera: this.usuarioActual?.idCarrera,
        //idFacultad: this.usuarioActual?.idFacultad,
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
              window.location.href = '/estudiante/solicitudes';
            }
            toast.remove();
          });
          pushContainer.appendChild(toast);
          setTimeout(()=> { if(toast.parentNode) toast.remove(); }, 5000);
        }

        if (!sessionStorage.getItem('demoPushShown')) {
          setTimeout(()=>{
            pushNotification('Nuevo trámite', 'Tu solicitud de certificado de notas ha sido procesada', 'C-2101');
            sessionStorage.setItem('demoPushShown', 'true');
          }, 8000);
        }
    }

    getNombre(){
        return `${this.usuarioActual?.nombres?.split(' ', 1) ?? ''} ${this.usuarioActual?.apellidos?.split(' ', 1) ?? ''}`;
    }

    getRol(){
        return 'Estudiante';
    }

    getIniciales(){
        return `${this.usuarioActual?.nombres?.substring(0, 1) ?? ''}${this.usuarioActual?.apellidos?.substring(0, 1) ?? ''}`;
    }

    cerrarSesion() {
        this.autenticacionService.cerrarSesion();
        window.location.href = '/login';
    }
}
