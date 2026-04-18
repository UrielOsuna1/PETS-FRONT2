import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// environment
import { environment } from '../../../environments/environment';
// services
import { CryptoService } from './crypto.service';
import { AppStorageServiceService } from './app-storage-service.service';

@Injectable({
    providedIn: 'root'
})
export class GatewayService {
    // gateway url
    private gatewayUrl = `${environment.api_url}/Gateway`;

    // campos sensibles que deben cifrarse en el data
    private sensitiveFields = ['password', 'email', 'phone', 'confirmPassword', 'refreshToken'];

    constructor(
        private http: HttpClient,
        private cryptoService: CryptoService
    ) { }

    // construir y enviar petición al gateway
    async post<T>(endpoint: string, data: Record<string, any>): Promise<T> {
        // encriptar el campo exp (timestamp)
        const timestamp = new Date().toISOString();
        const encryptedExp = await this.cryptoService.encrypt(timestamp);

        // encriptar campos sensibles en el data
        const encryptedData = await this.encryptSensitiveFields(data);

        // construir payload del gateway
        const payload = {
            endpoint: endpoint,
            exp: encryptedExp,
            data: encryptedData
        };

        // enviar petición al gateway con header para saltar interceptor
        const headers: { [key: string]: string } = { 'X-Skip-Interceptor': 'true' };
        
        // Add Authorization header if user is logged in
        const token = AppStorageServiceService.getAccessToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return this.http.post<T>(this.gatewayUrl, payload, { headers }).toPromise() as Promise<T>;
    }

    // construir y enviar petición al gateway SIN data (para logout)
    async postWithHeaders<T>(endpoint: string, headers: Record<string, string>): Promise<T> {
        // encriptar el campo exp (timestamp)
        const timestamp = new Date().toISOString();

        const encryptedExp = await this.cryptoService.encrypt(timestamp);

        // construir payload del gateway sin data
        const payload = {
            endpoint: endpoint,
            exp: encryptedExp
        };

        // enviar petición al gateway con headers + skip interceptor
        const allHeaders = {
            ...headers,
            'X-Skip-Interceptor': 'true'
        };
        return this.http.post<T>(this.gatewayUrl, payload, { headers: allHeaders }).toPromise() as Promise<T>;
    }

    // encriptar campos sensibles en un objeto
    private async encryptSensitiveFields(obj: Record<string, any>): Promise<Record<string, any>> {
        const result = { ...obj };

        for (const field of this.sensitiveFields) {
            if (result[field] && typeof result[field] === 'string') {
                result[field] = await this.cryptoService.encrypt(result[field]);
            }
        }

        return result;
    }
}
