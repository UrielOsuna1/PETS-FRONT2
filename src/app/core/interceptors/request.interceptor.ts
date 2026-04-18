import { HttpEvent, HttpHandlerFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
// service
import { AppStorageServiceService } from '../services/app-storage-service.service';
import { CryptoService } from '../services/crypto.service';

export const requestInterceptor = (request: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
    const cryptoService = inject(CryptoService);

    // verificar si se debe saltar el interceptor
    const skipInterceptor = request.headers.get('X-Skip-Interceptor') === 'true';

    if (skipInterceptor) {
        return next(request);
    }

    // agregar token a la solicitud
    request = addTokenToRequest(request);

    // cifrar campos sensibles en el body
    return from(encryptSensitiveFields(request, cryptoService)).pipe(
        switchMap(encryptedRequest => next(encryptedRequest))
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

// campos sensibles que deben cifrarse
const SENSITIVE_FIELDS = ['password', 'email', 'phone'];

// cifra campos sensibles en el body de la petición
const encryptSensitiveFields = async (
    request: HttpRequest<any>,
    cryptoService: CryptoService
): Promise<HttpRequest<any>> => {
    if (!request.body || typeof request.body !== 'object') {
        return request;
    }

    const encryptedBody = await cryptoService.encryptFields(request.body, SENSITIVE_FIELDS);

    return request.clone({
        body: encryptedBody
    });
};