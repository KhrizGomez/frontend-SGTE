import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    templateUrl: './admin-layout.html',
    styleUrl: './admin-layout.css'
})
export class AdminLayout {
    sidebarOpen = true;
    currentUser = 'Administrador';

    toggleSidebar() {
        this.sidebarOpen = !this.sidebarOpen;
    }

    logout() {
        window.location.href = '/login';
    }

    navItems = [
        { label: 'Dashboard', icon: 'bi-house-door-fill', route: '/administrador/dashboard' },
        { label: 'Usuarios', icon: 'bi-people-fill', route: '/administrador/usuarios' },
        { label: 'Roles', icon: 'bi-shield-lock-fill', route: '/administrador/roles' },
        { label: 'Carreras', icon: 'bi-building-fill', route: '/administrador/carreras' },
        { label: 'Materias', icon: 'bi-book-fill', route: '/administrador/materias' },
        { label: 'Reportes', icon: 'bi-bar-chart-fill', route: '/administrador/reportes' },
        { label: 'Configuración', icon: 'bi-gear-fill', route: '/administrador/configuracion' },
    ];
}
