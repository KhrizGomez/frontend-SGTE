import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { PlantillaCarrera, TipoTramiteDetalle, RegistrarTipoTramitePayload, FlujoTramite, PasoTramite, CategoriaTramite, GuardarPlantillaPayload, EtapaTramite, UsuarioAsignableTramite, GuardarFlujoCompletoPayload, GuardarFlujoCompletoResponse, RequisitoNuevoPlantilla, SolicitudDetalleResponse } from '../../models/decano/tramite-detalle.model';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class TramitesService {
    private readonly apiBaseUrl = `${environment.apiUrl}/api/tramites/tipos`;
    private readonly plantillasBaseUrl = `${environment.apiUrl}/api/tramites/plantillas`;
    private readonly categoriasBaseUrl = `${environment.apiUrl}/api/tramites/categorias`;

    constructor(private readonly http: HttpClient) {}

    getSolicitudesPorRol(nombreRol: string): Observable<SolicitudDetalleResponse[]> {
        return this.http.get<SolicitudDetalleResponse[]>(`${environment.apiUrl}/api/solicitudes/por-rol/${nombreRol}`);
    }

    getTiposTramiteDetalles(): Observable<TipoTramiteDetalle[]> {
        return this.http
            .get<TipoTramiteDetalle[]>(`${this.apiBaseUrl}/detalles`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarTipoTramite(item))));
    }

    getPlantillasPorCarrera(idCarrera: number): Observable<PlantillaCarrera[]> {
        return this.http
            .get<PlantillaCarrera[]>(`${environment.apiUrl}/api/tramites/detalles/carrera/${idCarrera}`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarPlantillaCarrera(item as unknown as Record<string, unknown>))));
    }

    getPlantillasPorFacultad(idFacultad: number): Observable<PlantillaCarrera[]> {
        return this.http
            .get<PlantillaCarrera[]>(`${environment.apiUrl}/api/tramites/detalles/facultad/${idFacultad}`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarPlantillaCarrera(item as unknown as Record<string, unknown>))));
    }

    getFlujos(): Observable<FlujoTramite[]> {
        return this.http
            .get<FlujoTramite[]>(`${environment.apiUrl}/api/tramites/flujos`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarFlujo(item as unknown as Record<string, unknown>))));
    }

    getCategoriasActivas(): Observable<CategoriaTramite[]> {
        return this.http
            .get<CategoriaTramite[]>(`${this.categoriasBaseUrl}/activas`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarCategoria(item as unknown as Record<string, unknown>))));
    }

    getEtapas(): Observable<EtapaTramite[]> {
        return this.http
            .get<EtapaTramite[]>(`${environment.apiUrl}/api/tramites/etapas`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarEtapa(item as unknown as Record<string, unknown>))));
    }

    getUsuariosAsignables(): Observable<UsuarioAsignableTramite[]> {
        return this.http
            .get<UsuarioAsignableTramite[]>(`${environment.apiUrl}/api/sistema/usuarios/filtro`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarUsuarioAsignable(item as unknown as Record<string, unknown>))));
    }

    guardarPlantilla(payload: GuardarPlantillaPayload): Observable<unknown> {
        return this.http.post<unknown>(`${this.plantillasBaseUrl}/guardar`, payload);
    }

    editarPlantilla(idPlantilla: number, payload: Omit<GuardarPlantillaPayload, 'requisitos'>): Observable<unknown> {
        return this.http.put<unknown>(`${this.plantillasBaseUrl}/editar/${idPlantilla}`, payload);
    }

    editarRequisitosPlantilla(idPlantilla: number, requisitos: RequisitoNuevoPlantilla[]): Observable<PlantillaCarrera> {
        return this.http.put<PlantillaCarrera>(`${this.plantillasBaseUrl}/${idPlantilla}/requisitos`, {
            requisitos,
        });
    }

    eliminarPlantilla(idPlantilla: number): Observable<unknown> {
        return this.http.delete<unknown>(`${this.plantillasBaseUrl}/eliminar/${idPlantilla}`);
    }

    guardarFlujoCompleto(payload: GuardarFlujoCompletoPayload): Observable<GuardarFlujoCompletoResponse> {
        return this.http.post<GuardarFlujoCompletoResponse>(`${environment.apiUrl}/api/tramites/flujos`, payload);
    }

    registrarTipoTramite(payload: RegistrarTipoTramitePayload): Observable<TipoTramiteDetalle> {
        return this.http
            .post<TipoTramiteDetalle>(this.apiBaseUrl, payload)
            .pipe(map((item) => this.normalizarTipoTramite(item)));
    }

    private normalizarTipoTramite(item: Partial<TipoTramiteDetalle>): TipoTramiteDetalle {
        return {
            idTipoTramite: item.idTipoTramite ?? 0,
            nombreTramite: item.nombreTramite ?? '',
            descripcionTramite: item.descripcionTramite ?? '',
            idCategoria: item.idCategoria ?? 0,
            categoria: item.categoria ?? '',
            idFlujo: item.idFlujo ?? 0,
            nombreFlujo: item.nombreFlujo ?? '',
            descripcionFlujo: item.descripcionFlujo ?? '',
            idUsuarioCreador: item.idUsuarioCreador ?? null,
            usuarioCreador: item.usuarioCreador ?? '',
            version: item.version ?? 1,
            pasosTramite: item.pasosTramite ?? [],
            requisitosTramite: item.requisitosTramite ?? [],
            idPlazo: item.idPlazo ?? 0,
            fechaApertura: item.fechaApertura ?? '',
            fechaCierre: item.fechaCierre ?? '',
            permiteExtension: item.permiteExtension ?? false,
            diasEstimados: item.diasEstimados ?? 0,
            estaActivo: item.estaActivo ?? false,
            disponibleExternos: item.disponibleExternos ?? false,
            pasos: item.pasos ?? null,
        };
    }

    private normalizarPlantillaCarrera(item: Record<string, unknown>): PlantillaCarrera {
        return {
            idPlantilla: Number(item['idPlantilla'] ?? 0),
            nombrePlantilla: String(item['nombrePlantilla'] ?? ''),
            descripcionPlantilla: String(item['descripcionPlantilla'] ?? ''),
            idCategoria: Number(item['idCategoria'] ?? 0),
            categoria: String(item['categoria'] ?? ''),
            idCarrera: Number(item['idCarrera'] ?? 0),
            carrera: String(item['carrera'] ?? ''),
            idFlujo: Number(item['idFlujo'] ?? 0),
            nombreFlujo: String(item['nombreFlujo'] ?? ''),
            descripcion: String(item['descripcion'] ?? ''),
            idUsuarioCreador: null,
            usuarioCreador: String(item['usuarioCreador'] ?? ''),
            version: Number(item['version'] ?? 1),
            pasosTramite: (item['pasosPlantilla'] as PlantillaCarrera['pasosTramite'] | undefined) ?? [],
            requisitosTramite: (item['requisitosPlantilla'] as PlantillaCarrera['requisitosTramite'] | undefined) ?? [],
            idVentana: null,
            fechaApertura: null,
            fechaCierre: null,
            permiteExtension: null,
            diasResolucionEstimados: Number(item['diasResolucionEstimados'] ?? 0),
            estaActivo: Boolean(item['estaActivo'] ?? false),
            disponibleExternos: Boolean(item['disponibleExternos'] ?? false),
            pasos: null,
        };
    }

    private normalizarFlujo(item: Record<string, unknown>): FlujoTramite {
        const idFlujo = Number(item['idFlujo'] ?? 0);

        return {
            idFlujo,
            nombreFlujo: String(item['nombreFlujo'] ?? ''),
            descripcionFlujo: String(item['descripcionFlujo'] ?? ''),
            estaActivo: Boolean(item['estaActivo'] ?? false),
            version: Number(item['version'] ?? 1),
            creadoPor: item['creadoPorId'] === null || item['creadoPorId'] === undefined ? null : Number(item['creadoPorId']),
            pasos: this.normalizarPasosFlujo(idFlujo, item['pasos'] as Record<string, unknown>[] | undefined),
        };
    }

    private normalizarCategoria(item: Record<string, unknown>): CategoriaTramite {
        return {
            idCategoria: Number(item['idCategoria'] ?? 0),
            nombreCategoria: String(item['nombreCategoria'] ?? ''),
            descripcionCategoria: String(item['descripcionCategoria'] ?? ''),
            estaActivo: Boolean(item['estaActivo'] ?? false),
        };
    }

    private normalizarEtapa(item: Record<string, unknown>): EtapaTramite {
        return {
            idEtapa: Number(item['idEtapa'] ?? 0),
            nombreEtapa: String(item['nombreEtapa'] ?? ''),
            descripcionEtapa: String(item['descripcionEtapa'] ?? ''),
            codigoEtapa: String(item['codigoEtapa'] ?? ''),
        };
    }

    private normalizarUsuarioAsignable(item: Record<string, unknown>): UsuarioAsignableTramite {
        return {
            idUsuario: Number(item['idUsuario'] ?? 0),
            nombres: String(item['nombres'] ?? ''),
            apellidos: String(item['apellidos'] ?? ''),
            idRol: item['idRol'] === null || item['idRol'] === undefined ? null : Number(item['idRol']),
            rol: String(item['rol'] ?? ''),
            idFacultad: item['idFacultad'] === null || item['idFacultad'] === undefined ? null : Number(item['idFacultad']),
            facultad: String(item['facultad'] ?? ''),
            idCarrera: item['idCarrera'] === null || item['idCarrera'] === undefined ? null : Number(item['idCarrera']),
            carrera: String(item['carrera'] ?? ''),
        };
    }

    private normalizarPasosFlujo(idFlujo: number, items: Record<string, unknown>[] | undefined): PasoTramite[] {
        return (items ?? []).map((item, index) => ({
            idPaso: Number(item['idPaso'] ?? index + 1),
            idFlujo,
            ordenPaso: Number(item['ordenPaso'] ?? index + 1),
            idEtapa: Number((item['etapa'] as Record<string, unknown> | undefined)?.['idEtapa'] ?? 0),
            codigoEtapa: String((item['etapa'] as Record<string, unknown> | undefined)?.['codigoEtapa'] ?? ''),
            nombreEtapa: String((item['etapa'] as Record<string, unknown> | undefined)?.['nombreEtapa'] ?? ''),
            descripcionEtapa: String((item['etapa'] as Record<string, unknown> | undefined)?.['descripcionEtapa'] ?? ''),
            idRolRequerido: item['rolRequeridoId'] === null || item['rolRequeridoId'] === undefined ? null : Number(item['rolRequeridoId']),
            rolRequerido: item['rolRequerido'] === null || item['rolRequerido'] === undefined ? null : String(item['rolRequerido']),
            idUsuarioEncargado: item['idUsuarioEncargado'] === null || item['idUsuarioEncargado'] === undefined ? null : Number(item['idUsuarioEncargado']),
            usuarioEncargado: item['usuarioEncargado'] === null || item['usuarioEncargado'] === undefined ? null : String(item['usuarioEncargado']),
            horasSla: Number(item['horasSla'] ?? 0),
        }));
    }
}

