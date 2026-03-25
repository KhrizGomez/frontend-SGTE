import {Component, OnInit} from '@angular/core';
import {RouterOutlet, RouterLink} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {LoginResponse} from '../../../models/auth.model';
import {AiChatComponent} from '../../shared/ai-chat/ai-chat.component';
import {ChatbotConfig} from '../../../models/ai/chatbot.model';

@Component({
    selector: 'app-coordinator-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NgOptimizedImage, RouterLink, AiChatComponent],
    templateUrl: './coordinator-layout.html',
    styleUrl: './coordinator-layout.css'
})
export class CoordinatorLayout implements OnInit{
    usuarioActual: LoginResponse | null = null;

    chatbotConfig: ChatbotConfig = {
        module: 'coordinador',
        title: 'Asistente de Coordinación',
        welcomeMessage: '¡Hola! Soy el asistente del SGTE para Coordinación. Puedo ayudarte a gestionar trámites, entender plazos y orientarte sobre los procesos académicos. ¿En qué te ayudo?',
        quickActions: [
            { label: '¿Cómo aprobar un trámite?',        prompt: '¿Cuáles son los pasos para revisar y aprobar un trámite estudiantil?',          icon: 'bi-check-circle' },
            { label: 'Plazos de trámites vigentes',      prompt: '¿Cuáles son los plazos vigentes para los diferentes tipos de trámites?',         icon: 'bi-calendar-check' },
            { label: 'Trámites que puedo rechazar',      prompt: '¿En qué casos puedo rechazar una solicitud y qué debo registrar?',                icon: 'bi-x-circle' },
            { label: 'Generar reportes',                 prompt: '¿Cómo genero un reporte de trámites filtrado por fecha, tipo o estado?',          icon: 'bi-file-earmark-bar-graph' },
        ]
    };

    constructor(private authService: AuthService) {}

    ngOnInit() {
        this.usuarioActual = this.authService.getCurrentUser(   );
    }

    obtenerNombreUsuarioActual(){
        return `${this.usuarioActual?.nombres.split(' ', 1) ?? ''} ${this.usuarioActual?.apellidos.split(' ', 1) ?? ''}`;
    }

    obtenerInicialesUsuarioActual(){
        return `${this.usuarioActual?.nombres.substr(0, 1) ?? ''}${this.usuarioActual?.apellidos.substr(0, 1) ?? ''}`;
    }
}
