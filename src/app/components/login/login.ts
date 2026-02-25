import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserValidationService } from '../../services/user-validation.service';
import { UserRegistrationService } from '../../services/user-registration-service';

declare var bootstrap: any;

@Component({
    selector: 'app-login',
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html',
    styleUrl: './login.css',
})
export class Login implements AfterViewInit  {

    estudianteExterno: Boolean = false;
    cedula: string = '';
    nombres: string = '';
    apellidos: string = '';

    constructor(
        private userValidationService: UserValidationService,
        private userRegistrationService: UserRegistrationService
    ) { }

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

        // Si NO es externo, validar con la API
        if (!this.estudianteExterno) {
            this.userValidationService.validarUsuario(this.cedula).subscribe({
                next: (data) => {
                    console.log('Datos del usuario validado:', data);
                    this.userRegistrationService.registrarUsuario(data).subscribe({
                        next: (response) => {
                            console.log('Usuario registrado en la API de registro:', response);
                            alert('Usuario registrado correctamente en la API de registro');
                        },
                        error: (error) => {
                            console.error('Error al registrar usuario en la API de registro:', error);
                            alert('Error al registrar usuario en la API de registro');
                        }
                    });
                },
                error: (error) => {
                    console.error('Error al validar usuario:', error);
                    alert('Error al validar usuario. Verifique la cédula');
                }
            });
        }
        else {
            // Si es externo, validar que tenga nombres y apellidos
            if (!this.nombres || !this.apellidos) {
                alert('Por favor ingrese nombres y apellidos');
                return;
            }
            console.log('Registrando usuario externo:', {
                cedula: this.cedula,
                nombres: this.nombres,
                apellidos: this.apellidos
            });
            // Aquí puedes enviar los datos del usuario externo a otra API
            alert('Usuario externo registrado');
        }
    }

    ngAfterViewInit() {
        const modalElement = document.getElementById('modalCreateAccount');

        if (modalElement) {
            // Escuchamos el evento nativo de Bootstrap "hidden.bs.modal"
            modalElement.addEventListener('hidden.bs.modal', () => {
                // Al cerrarse, reiniciamos las variables
                this.estudianteExterno = false;
                this.cedula = '';
                this.nombres = '';
                this.apellidos = '';
                console.log('Modal cerrado. Formulario reiniciado.');
            });
        }
    }

}
