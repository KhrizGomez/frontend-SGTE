import { Component, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-student-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './student-layout.html',
    styleUrl: './student-layout.css'
})
export class StudentLayout implements OnInit {
    sidebarOpen = true;
    showLogout = false;
    userName = 'Estudiante';
    userInitials = 'ES';
    userEmail = '';

    navPrincipal = [
        { label: 'Dashboard', route: '/estudiante/dashboard', icon: 'bi bi-grid-fill', color: '#3b82f6' },
        { label: 'Solicitudes', route: '/estudiante/solicitudes', icon: 'bi bi-clipboard-check-fill', color: '#f59e0b' },
        { label: 'Seguimiento', route: '/estudiante/seguimiento', icon: 'bi bi-bar-chart-fill', color: '#10b981' },
    ];

    navHerramientas = [
        { label: 'Asistente IA', route: '/estudiante/asistente', icon: 'bi bi-robot', color: '#00ced1' },
        { label: 'Notificaciones', route: '/estudiante/notificaciones', icon: 'bi bi-bell-fill', color: '#ef4444' },
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
