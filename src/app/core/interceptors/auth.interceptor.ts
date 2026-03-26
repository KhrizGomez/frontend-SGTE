import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { AutenticacionService } from '../../services/general/autenticacion.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
    if (request.headers.has('Authorization')) {
        return next(request);
    }

    const autenticacionService = inject(AutenticacionService);
    const token = autenticacionService.obtenerTokenActual();
    if (!token) {
        return next(request);
    }

    const authorization = token.toLowerCase().startsWith('bearer ')
        ? token
        : `Bearer ${token}`;

    return next(request.clone({
        setHeaders: {
            Authorization: authorization,
        },
    }));
};