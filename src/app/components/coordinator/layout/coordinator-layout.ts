import {Component, OnInit} from '@angular/core';
import {RouterOutlet, RouterLink, RouterLinkActive} from '@angular/router';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {AuthService} from '../../../services/auth.service';
import {LoginResponse} from '../../../models/auth.model';

@Component({
    selector: 'app-coordinator-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, NgOptimizedImage, RouterLink],
    templateUrl: './coordinator-layout.html',
    styleUrl: './coordinator-layout.css'
})
export class CoordinatorLayout implements OnInit{
    usuarioActual: LoginResponse | null = null;

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
