import { Injectable } from '@angular/core';
// environment
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CryptoService {
    private readonly secretKey: string;

    constructor() {
        this.secretKey = environment.encryption_key;
    }

    // cifrado asimetrico con AES-GCM
    async encrypt(text: string): Promise<string> {
        if (!text) return text;

        const encoder = new TextEncoder();
        const data = encoder.encode(text);

        const key = await this.getKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        // combinar iv + datos cifrados y convertir a base64
        const combined = new Uint8Array(iv.length + encrypted.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encrypted), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    // descifrado asimetrico con AES-GCM
    async decrypt(encryptedBase64: string): Promise<string> {
        if (!encryptedBase64) return encryptedBase64;

        const combined = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
        const iv = combined.slice(0, 12);
        const data = combined.slice(12);

        const key = await this.getKey();

        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    // cifrado de campos especificos de un objeto
    async encryptFields(
        obj: Record<string, any>,
        fieldsToEncrypt: string[]
    ): Promise<Record<string, any>> {
        const result = { ...obj };

        // Solo agregar timestamp si NO existe (para no sobrescribir el del gateway)
        if (!result['exp']) {
            result['exp'] = new Date().toISOString();
        }

        // cifrar campos sensibles (sin agregar exp automáticamente)
        for (const field of fieldsToEncrypt) {
            if (result[field] && typeof result[field] === 'string') {
                result[field] = await this.encrypt(result[field]);
            }
        }

        // Encriptar exp solo si es texto plano (fecha ISO), no si ya está encriptado
        if (result['exp'] && typeof result['exp'] === 'string') {
            // Detectar si es formato ISO (texto plano) vs base64 (ya encriptado)
            const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/.test(result['exp']);
            if (isIsoDate) {
                result['exp'] = await this.encrypt(result['exp']);
            }
        }

        return result;
    }

    // clave de encriptacion
    private async getKey(): Promise<CryptoKey> {
        const keyBytes = this.hexToBytes(this.secretKey);

        return await crypto.subtle.importKey(
            'raw',
            keyBytes.buffer as ArrayBuffer,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // convertir hex a bytes
    private hexToBytes(hex: string): Uint8Array {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
            bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
        }
        return bytes;
    }
}
