import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserValidationService } from '../../services/user-validation.service';
import { UserRegistrationService } from '../../services/user-registration-service';
import { AuthService } from '../../services/auth.service';

declare var bootstrap: any;

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login implements AfterViewInit {

    // ── Login ──────────────────────────────────────────────
    nombreUsuario: string = '';
    contrasena: string = '';
    loginError: string = '';
    loginLoading: boolean = false;

    // ── Registro ───────────────────────────────────────────
    estudianteExterno: Boolean = false;
    cedula: string = '';
    nombres: string = '';
    apellidos: string = '';

    constructor(
        private authService: AuthService,
        private router: Router,
        private userValidationService: UserValidationService,
        private userRegistrationService: UserRegistrationService
    ) { }

    // ── Auth login ─────────────────────────────────────────
    iniciarSesion() {
        this.loginError = '';

        if (!this.nombreUsuario.trim() || !this.contrasena.trim()) {
            this.loginError = 'Por favor ingrese usuario y contraseña.';
            return;
        }

        this.loginLoading = true;

        this.authService.login({
            nombreUsuario: this.nombreUsuario.trim(),
            contrasena: this.contrasena.trim()
        }).subscribe({
            next: (response) => {
                this.loginLoading = false;
                console.log('Login exitoso:', response);
                const ruta = this.authService.getRouteForRole(response.roles);
                this.router.navigateByUrl(ruta);
            },
            error: (err) => {
                this.loginLoading = false;
                console.error('Error de autenticación:', err);
                if (err.status === 401 || err.status === 403) {
                    this.loginError = 'Usuario o contraseña incorrectos.';
                } else if (err.status === 0) {
                    this.loginError = 'No se pudo conectar con el servidor.';
                } else {
                    this.loginError = err.error?.mensaje ?? 'Error al iniciar sesión.';
                }
            }
        });
    }

    // ── Modal crear cuenta ─────────────────────────────────
    abrirModalCreateAccount() {
        const modalElement = document.getElementById('modalCreateAccount');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    registrarCuenta() {
        if (!this.cedula) {
            alert('Por favor ingrese la cédula');
            return;
        }

        if (!this.estudianteExterno) {
            this.userValidationService.validarUsuario(this.cedula).subscribe({
                next: (data) => {
                    this.userRegistrationService.registrarUsuario(data).subscribe({
                        next: () => alert('Usuario registrado correctamente'),
                        error: () => alert('Error al registrar usuario')
                    });
                },
                error: () => alert('Error al validar usuario. Verifique la cédula')
            });
        } else {
            if (!this.nombres || !this.apellidos) {
                alert('Por favor ingrese nombres y apellidos');
                return;
            }
            alert('Usuario externo registrado');
        }
    }

    ngAfterViewInit() {
        const modalElement = document.getElementById('modalCreateAccount');
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', () => {
                this.estudianteExterno = false;
                this.cedula = '';
                this.nombres = '';
                this.apellidos = '';
            });
        }
    }
}
