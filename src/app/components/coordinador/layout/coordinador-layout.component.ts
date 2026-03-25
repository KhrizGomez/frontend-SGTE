import {Component, OnInit, ViewEncapsulation, AfterViewInit} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AutenticacionService } from '../../../services/general/autenticacion.service';
import {AutenticacionRespuesta} from '../../../models/general/autenticacion.model';
import {AiChatComponent} from '../../shared/ai-chat/ai-chat.component';
import {ChatbotConfig} from '../../../models/ai/chatbot.model';
import { ToastService } from '../../../services/general/toast.service';


@Component({
    selector: 'app-coordinador-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AiChatComponent],
    templateUrl: './coordinador-layout.component.html',
    styleUrl: './coordinador-layout.component.css',
    encapsulation: ViewEncapsulation.None
})
export class CoordinadorLayoutComponent implements OnInit, AfterViewInit {
    usuarioActual: AutenticacionRespuesta | null = null;

    chatConfig: ChatbotConfig = {
        module: 'coordinador',
        title: 'Asistente SGTE',
        welcomeMessage: '¡Hola! Soy el asistente del SGTE. Puedo ayudarte a gestionar trámites, revisar solicitudes y consultar el estado del flujo de tu carrera.',
        quickActions: [
            { label: 'Solicitudes pendientes', prompt: '¿Cuántas solicitudes tengo pendientes de revisar?', icon: 'bi-clock-history' },
            { label: 'Trámites disponibles', prompt: '¿Qué tipos de trámites puedo gestionar como coordinador?', icon: 'bi-list-check' },
            { label: 'Plazos vigentes', prompt: '¿Hay algún trámite próximo a vencer o con plazo urgente?', icon: 'bi-calendar-event' },
            { label: 'Cómo rechazar', prompt: '¿Cómo rechazo una solicitud y qué debo indicar?', icon: 'bi-x-circle' },
        ],
    };

    constructor(private autenticacionService: AutenticacionService, private toastService: ToastService) {}

    ngOnInit() {
        this.usuarioActual = this.autenticacionService.obtenerUsuarioActual();
        this.chatConfig = {
            ...this.chatConfig,
            userId:    this.usuarioActual?.idUsuario,
            idCarrera: this.usuarioActual?.idCarrera,
        };
    }

    ngAfterViewInit(): void {
        if (!sessionStorage.getItem('demoPushShown')) {
          setTimeout(()=>{
            this.toastService.show('Nuevo trámite', 'Juan Pérez ha solicitado Cambio de carrera', 'info');
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
