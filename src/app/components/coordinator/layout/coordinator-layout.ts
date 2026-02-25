import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-coordinator-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './coordinator-layout.html',
    styleUrl: './coordinator-layout.css'
})
export class CoordinatorLayout implements OnInit {
    sidebarOpen = true;
    showLogout = false;
    userName = 'Coordinador';
    userInitials = 'CO';
    userEmail = '';

    navPrincipal = [
        { label: 'Dashboard', route: '/coordinador/dashboard', icon: 'bi bi-grid-fill', color: '#3b82f6' },
        { label: 'Solicitudes', route: '/coordinador/solicitudes', icon: 'bi bi-clipboard-check-fill', color: '#f59e0b' },
        { label: 'Estudiantes', route: '/coordinador/estudiantes', icon: 'bi bi-people-fill', color: '#8b5cf6' },
        { label: 'Docentes', route: '/coordinador/docentes', icon: 'bi bi-person-badge-fill', color: '#06b6d4' },
        { label: 'Reportes', route: '/coordinador/reportes', icon: 'bi bi-bar-chart-fill', color: '#10b981' },
    ];

    navHerramientas = [
        { label: 'Asistente IA', route: '/coordinador/asistente', icon: 'bi bi-robot', color: '#00ced1' },
        { label: 'Notificaciones', route: '/coordinador/notificaciones', icon: 'bi bi-bell-fill', color: '#ef4444' },
        { label: 'Configuración', route: '/coordinador/configuracion', icon: 'bi bi-gear-fill', color: '#374151' },
    ];

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        const user = this.authService.getCurrentUser();
        if (user) {
            this.userName = `${user.nombres} ${user.apellidos}`.trim();
            this.userInitials = (user.nombres?.[0] ?? '') + (user.apellidos?.[0] ?? '');
            this.userEmail = user.correoInstitucional || '';
        }
    }

    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
    toggleLogout() { this.showLogout = !this.showLogout; }

    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
