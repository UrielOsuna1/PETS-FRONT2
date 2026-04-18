import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
// service
import { AuthService } from '../services/auth.service';
import { AppStorageServiceService } from '../services/app-storage-service.service';

export const errorInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    // saltar interceptor para solicitudes específicas
    if (request.headers.get('X-Skip-Interceptor') === 'true') {
        return next(request);
    }

    const authService = inject(AuthService);

    return next(request).pipe(
        catchError((httpErrorRes: HttpErrorResponse) => {
            // no intentar refresh del token para:
            // 1. solicitudes de login
            // 2. solicitudes de logout  
            // 3. solicitudes de refresh token
            const isLoginRequest = request.url.includes('/auth/login');
            const isLogoutRequest = request.url.includes('/auth/logout');
            const isRefreshTokenRequest = request.url.includes('/auth/refresh');

            // si el error es 401 (Unauthorized) y no es una solicitud especial, intentar refresh token
            if (httpErrorRes.status === 401 && !isLoginRequest && !isLogoutRequest && !isRefreshTokenRequest) {
                return refreshToken(next, request, authService);
            }

            // para otros errores, simplemente propagar el error
            return throwError(() => httpErrorRes);
        })
    );
};

const refreshToken = (next: HttpHandlerFn, request: HttpRequest<any>, authService: AuthService) => {
    return from(authService.refreshToken()).pipe(
        switchMap((success) => {
            if (success) {
                // reintentar la petición original con nuevo token
                const newRequest = addTokenToRequest(request);
                return next(newRequest);
            } else {
                // si el refresh falla, redirigir al login
                authService.logout();
                return throwError(() => new Error('Token refresh failed'));
            }
        }),
        catchError(() => {
            // si hay error en el refresh, redirigir al login
            authService.logout();
            return throwError(() => new Error('Token refresh failed'));
        })
    );
};

const addTokenToRequest = (request: HttpRequest<any>): HttpRequest<any> => {
    const token = AppStorageServiceService.getAccessToken();

    if (!token) {
        return request;
    }

    return request.clone({
        headers: request.headers.set('Authorization', `Bearer ${token}`),
    });
};