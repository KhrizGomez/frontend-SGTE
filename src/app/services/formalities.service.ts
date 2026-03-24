import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
    RegistrarTipoTramitePayload,
    TipoTramiteDetalle,
} from '../models/tramite-detalle.model';
import { environment } from '../../environments/environment.development';

@Injectable({
    providedIn: 'root',
})
export class FormalitiesService {
    private readonly apiBaseUrl = `${environment.apiUrl}/api/tramites/tipos`;

    constructor(private readonly http: HttpClient) {}

    getTiposTramiteDetalles(): Observable<TipoTramiteDetalle[]> {
        return this.http
            .get<TipoTramiteDetalle[]>(`${this.apiBaseUrl}/detalles`)
            .pipe(map((items) => (items ?? []).map((item) => this.normalizarTipoTramite(item))));
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
        };
    }
}

