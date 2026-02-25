import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-dean-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './dean-layout.html',
    styleUrl: './dean-layout.css'
})
export class DeanLayout implements OnInit {
    sidebarOpen = true;
    showLogout = false;
    userName = 'Decano';
    userInitials = 'DE';
    userEmail = '';

    navPrincipal = [
        { label: 'Dashboard', route: '/decano/dashboard', icon: 'bi bi-grid-fill', color: '#3b82f6' },
        { label: 'Solicitudes', route: '/decano/solicitudes', icon: 'bi bi-clipboard-check-fill', color: '#f59e0b' },
        { label: 'Coordinadores', route: '/decano/coordinadores', icon: 'bi bi-person-check-fill', color: '#8b5cf6' },
        { label: 'Estadísticas', route: '/decano/estadisticas', icon: 'bi bi-graph-up-arrow', color: '#10b981' },
        { label: 'Reportes', route: '/decano/reportes', icon: 'bi bi-file-earmark-bar-graph-fill', color: '#ef4444' },
    ];

    navHerramientas = [
        { label: 'Notificaciones', route: '/decano/notificaciones', icon: 'bi bi-bell-fill', color: '#ef4444' },
        { label: 'Configuración', route: '/decano/configuracion', icon: 'bi bi-gear-fill', color: '#374151' },
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
