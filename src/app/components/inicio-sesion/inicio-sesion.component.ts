import { AfterViewInit, Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ValidacionUsuarioService } from '../../services/general/validacion-usuario.service';
import { RegistroUsuarioService } from '../../services/general/registro-usuario.service';
import { AutenticacionService } from '../../services/general/autenticacion.service';
import { RegistroUsuarioPayload } from '../../models/general/registro-usuario.model';

declare var bootstrap: any;

@Component({
    selector: 'app-inicio-sesion',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inicio-sesion.component.html',
    styleUrl: './inicio-sesion.component.css',
})
export class InicioSesionComponent implements AfterViewInit {

    // Login
    nombreUsuario: string = '';
    contrasena: string = '';
    cargandoInicioSesion: boolean = false;

    // Registro
    estudianteExterno: boolean = false;
    cedula: string = '';
    nombres: string = '';
    apellidos: string = '';
    cargandoRegistro: boolean = false;

    // Mensajes Genéricos
    mensajeTitulo: string = '';
    mensajeContenido: string = '';
    esErrorMensaje: boolean = false;

    constructor(
        private autenticacionService: AutenticacionService,
        private router: Router,
        private validacionUsuarioService: ValidacionUsuarioService,
        private registroUsuarioService: RegistroUsuarioService,
        private cdr: ChangeDetectorRef
    ) { }

    // Auth login
    iniciarSesion() {
        if (!this.nombreUsuario.trim() || !this.contrasena.trim()) {
            this.mostrarModalMensaje('Error', 'Por favor ingrese usuario y contraseña.', true);
            return;
        }

        this.cargandoInicioSesion = true;

        this.autenticacionService.iniciarSesion({
            nombreUsuario: this.nombreUsuario.trim(),
            contrasena: this.contrasena.trim()
        }).subscribe({
            next: (response) => {
                this.cargandoInicioSesion = false;
                console.log('Login exitoso:', response);
                const ruta = this.autenticacionService.obtenerRutaPorRolUsuarioActual(response.rol);
                this.mostrarModalMensaje('Bienvenido', `¡Hola, ${response.nombres} ${response.apellidos}!`, false, () => {
                    void this.router.navigate([ruta]);
                });
            },
            error: (err) => {
                this.cargandoInicioSesion = false;
                console.error('Error de autenticación:', err);
                let msj = 'Error al iniciar sesión.';
                if (err.status === 401 || err.status === 403) {
                    msj = 'Usuario o contraseña incorrectos.';
                } else if (err.status === 0) {
                    msj = 'No se pudo conectar con el servidor.';
                } else {
                    msj = err.error?.mensaje ?? 'Error al iniciar sesión.';
                }
                this.mostrarModalMensaje('Error de Autenticación', msj, true);
            }
        });
    }

    // Modal crear cuenta
    abrirModalCreateAccount() {
        const modalElement = document.getElementById('modalCreateAccount');
        if (modalElement) {
            const modal = new bootstrap.Modal(modalElement);
            modal.show();
        }
    }

    registrarCuenta() {
        const cedulaNormalizada = this.cedula.trim();

        if (!cedulaNormalizada) {
            this.mostrarModalMensaje('Error', 'Por favor ingrese la cedula.', true);
            return;
        }

        this.cedula = cedulaNormalizada;

        this.cargandoRegistro = true;

        if (!this.estudianteExterno) {
            this.validacionUsuarioService.validarUsuario(cedulaNormalizada).subscribe({
                next: (data) => {
                    const payload = this.mapToRegistroPayload(data);
                    this.registroUsuarioService.registrarUsuario(payload).subscribe({
                        next: (response) => {
                            this.cargandoRegistro = false;
                            const usernameGenerado = response.nombreUsuario ?? payload.cedula;
                            const correos = [payload.correoInstitucional, payload.correoPersonal].filter(c => c && c.trim() !== '');
                            
                            if (correos.length > 0) {
                                correos.forEach(email => {
                                    this.registroUsuarioService.enviarCorreoCredenciales(email!, usernameGenerado, payload.cedula).subscribe({
                                        next: () => console.log('Correo de credenciales enviado a', email),
                                        error: (err: any) => console.error('Error enviando correo', err)
                                    });
                                });
                            }

                            this.mostrarModalMensaje('Registro Exitoso', `¡Registro exitoso! Bienvenido/a, ${payload.nombres} ${payload.apellidos}. Las credenciales han sido enviadas a su correo.`, false);
                            this.cerrarModalCrearCuenta();
                        },
                        error: (err) => {
                            this.cargandoRegistro = false;
                            this.mostrarModalMensaje('Error de Registro', this.obtenerMensajeErrorRegistro(err), true);
                        }
                    });
                },
                error: (err) => {
                    this.cargandoRegistro = false;
                    if (err.status === 404) {
                        this.mostrarModalMensaje('Error de Validación', 'No existe usuario con esa cedula en el servicio de validacion.', true);
                        return;
                    }
                    this.mostrarModalMensaje('Error de Validación', 'Error al validar usuario. Verifique la cedula.', true);
                }
            });
        } else {
            if (!this.nombres || !this.apellidos) {
                this.cargandoRegistro = false;
                this.mostrarModalMensaje('Error', 'Por favor ingrese nombres y apellidos.', true);
                return;
            }

            const payload: RegistroUsuarioPayload = {
                cedula: this.cedula.trim(),
                nombres: this.nombres.trim(),
                apellidos: this.apellidos.trim(),
                rol: 'estudiante',
                estadoUsuario: true,
            };

            this.registroUsuarioService.registrarUsuario(payload).subscribe({
                next: (response) => {
                    this.cargandoRegistro = false;
                    const usernameGenerado = response.nombreUsuario ?? payload.cedula;
                    const correos = [payload.correoInstitucional, payload.correoPersonal].filter(c => c && c.trim() !== '');

                    if (correos.length > 0) {
                        correos.forEach(email => {
                            this.registroUsuarioService.enviarCorreoCredenciales(email!, usernameGenerado, payload.cedula).subscribe({
                                next: () => console.log('Correo de credenciales enviado a', email),
                                error: (err: any) => console.error('Error enviando correo', err)
                            });
                        });
                    }

                    this.mostrarModalMensaje('Registro Exitoso', `¡Registro exitoso! Bienvenido/a, ${payload.nombres} ${payload.apellidos}. Las credenciales han sido enviadas a su correo.`, false);
                    this.cerrarModalCrearCuenta();
                },
                error: (err: any) => {
                    this.cargandoRegistro = false;
                    this.mostrarModalMensaje('Error de Registro', this.obtenerMensajeErrorRegistro(err), true);
                }
            });
        }
    }

    cerrarModalCrearCuenta() {
        const modalElement = document.getElementById('modalCreateAccount');
        if (modalElement) {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            }
        }
    }

    mostrarModalMensaje(titulo: string, mensaje: string, esError: boolean, onClose?: () => void) {
        this.mensajeTitulo = titulo;
        this.mensajeContenido = mensaje;
        this.esErrorMensaje = esError;
        this.cdr.detectChanges();

        const modalElement = document.getElementById('modalMensaje');
        if (modalElement) {
            const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
            if (onClose) {
                const handler = () => {
                    modalElement.removeEventListener('hidden.bs.modal', handler);
                    onClose();
                };
                modalElement.addEventListener('hidden.bs.modal', handler);
            }
            modal.show();
        }
    }

    private mapToRegistroPayload(data: any): RegistroUsuarioPayload {
        return {
            cedula: String(data?.cedula ?? this.cedula).trim(),
            nombres: String(data?.nombres ?? this.nombres).trim(),
            apellidos: String(data?.apellidos ?? this.apellidos).trim(),
            correoPersonal: data?.correoPersonal,
            correoInstitucional: data?.correoInstitucional,
            telefono: data?.telefono,
            fechaNacimiento: data?.fechaNacimiento,
            genero: data?.genero,
            direccion: data?.direccion,
            rol: data?.rol ?? 'estudiante',
            estadoUsuario: data?.estadoUsuario ?? true,
            idFacultad: data?.idFacultad,
            nombreFacultad: data?.nombreFacultad,
            codigoFacultad: data?.codigoFacultad,
            ubicacionOficinaFacultad: data?.ubicacionOficinaFacultad,
            emailFacultad: data?.emailFacultad,
            idCarrera: data?.idCarrera,
            nombreCarrera: data?.nombreCarrera,
            codigoCarrera: data?.codigoCarrera,
            duracionSemestres: data?.duracionSemestres,
            modalidad: data?.modalidad,
            tituloOtorga: data?.tituloOtorga,
            idEstudiante: data?.idEstudiante,
            numeroMatricula: data?.numeroMatricula,
            paralelo: data?.paralelo,
            jornada: data?.jornada,
            fechaIngreso: data?.fechaIngreso,
            fechaEgreso: data?.fechaEgreso,
            estadoAcademico: data?.estadoAcademico,
            promedioGeneral: data?.promedioGeneral,
            creditosAprobados: data?.creditosAprobados,
            creditosTotales: data?.creditosTotales,
            matriculado: data?.matriculado,
            esBecado: data?.esBecado,
            tipoBeca: data?.tipoBeca,
            idSemestre: data?.idSemestre,
            codigoPeriodo: data?.codigoPeriodo,
            nombrePeriodo: data?.nombrePeriodo,
            fechaInicioPeriodo: data?.fechaInicioPeriodo,
            fechaFinPeriodo: data?.fechaFinPeriodo,
            esPeriodoActual: data?.esPeriodoActual,
            idCoordinador: data?.idCoordinador,
            horarioAtencion: data?.horarioAtencion,
            oficinaAtencion: data?.oficinaAtencion,
            fechaNombramientoCoordinador: data?.fechaNombramientoCoordinador,
            fechaFinPeriodoCoordinador: data?.fechaFinPeriodoCoordinador,
            resolucionNombramiento: data?.resolucionNombramiento,
            idDecano: data?.idDecano,
            fechaNombramientoDecano: data?.fechaNombramientoDecano,
            fechaFinPeriodoDecano: data?.fechaFinPeriodoDecano,
            extensionTelefonica: data?.extensionTelefonica,
        };
    }

    private obtenerMensajeErrorRegistro(err: any): string {
        const urlConError = err?.url ? ` URL: ${err.url}` : '';

        if (err?.status === 0) {
            return `No se pudo conectar al servidor de registro.${urlConError}`;
        }
        if (err?.status === 400) {
            return err?.error?.mensaje ?? err?.error ?? 'Datos invalidos para registrar usuario.';
        }
        if (err?.status === 404) {
            return `No existe el endpoint de registro. Revise la ruta /api/sistema/registro.${urlConError}`;
        }
        if (err?.status === 409) {
            return err?.error?.mensaje ?? err?.error ?? 'El usuario ya existe.';
        }
        return err?.error?.mensaje ?? err?.error ?? 'Error al registrar usuario.';
    }

    ngAfterViewInit() {
        const modalElement = document.getElementById('modalCreateAccount');
        if (modalElement) {
            modalElement.addEventListener('hidden.bs.modal', () => {
                this.estudianteExterno = false;
                this.cedula = '';
                this.nombres = '';
                this.apellidos = '';
                this.cargandoRegistro = false;
            });
        }
    }
}
