import { Injectable } from '@angular/core';
// common
import { CommonResponseDTO } from '../dtos/common/common-response-dto';
// dtos
import { LoginResponseDTO } from '../dtos/auth/login-response-dto';

@Injectable({
  providedIn: 'root',
})
export class AppStorageServiceService {
  constructor() { }

  // guardar access token y refresh token en localstorage
  static set login(response: CommonResponseDTO<LoginResponseDTO>) {
    if (response.success && response.data) {
      // decodificar JWT para extraer información
      const payload = this.decodeToken(response.data.accessToken);

      // extraer roles del token
      const roleClaim = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        ?? payload['role']
        ?? payload['roles'];

      const roles = Array.isArray(roleClaim) ? roleClaim : (roleClaim ? [roleClaim] : []);

      // crear objeto de autenticación completo
      const authData = {
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
        roles: roles,
        user: {
          // Extraer del JWT decodificado
          userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload.sub || '',
          role: roleClaim || '', // Solo el rol sin formato
          jti: payload.jti || '',
          iat: payload.iat || 0,
          nbf: payload.nbf || 0,
          exp: payload.exp || 0,
          iss: payload.iss || '',
          aud: payload.aud || '',
        },
        loginTime: Date.now(),
        lastActivity: Date.now()
      };

      // guardar información completa
      this.set('authData', authData);

      // mantener compatibilidad con métodos anteriores
      this.getSetItem('accessToken', response.data.accessToken);
      this.getSetItem('refreshToken', response.data.refreshToken);
      this.getSetItem('loginTime', Date.now());
      this.lastActivity(Date.now());
    } else {
    }
  }

  // método genérico get/set
  static getSetItem(k: string, v: any): any {
    if (v !== undefined) {
      this.set(k, v);
    }
    return this.get(k);
  }

  // guardar en localStorage
  static set(key: string, value: any) {
    if (this.isLocalStorageAvailable()) {
      if (value !== null && typeof value === 'object') {
        value = JSON.stringify(value);
      }
      localStorage.setItem(key, value);
    }
  }

  // obtener de localStorage
  static get(key: string) {
    if (!this.isLocalStorageAvailable()) {
      return null;
    }

    let valor = localStorage.getItem(key);
    try {
      valor = JSON.parse(valor!);
    } catch (e) { }
    return valor;
  }

  // verificar si localStorage está disponible
  static isLocalStorageAvailable(): boolean {
    try {
      return typeof localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  // timestamp de última actividad
  static lastActivity(v?: number): number | undefined {
    return this.getSetItem('lastActivity', v) || undefined;
  }

  // limpiar todo el storage
  static clear() {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('lastActivity');
      localStorage.removeItem('authData');
    }
  }

  // decodificar JWT
  static decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return {};
    }
  }

  // obtener datos de autenticación completos
  static getAuthData(): any {
    return this.get('authData');
  }

  // obtener roles del usuario
  static getRoles(): string[] {
    const authData = this.get('authData') as any;
    return authData?.roles || [];
  }

  // obtener información del usuario
  static getUserInfo(): any {
    const authData = this.get('authData') as any;
    return authData?.user || null;
  }

  // guardar información del perfil de usuario (firstName, lastName, email, phone)
  static setUserProfile(profile: { firstName: string; lastName: string; email?: string; phone?: string; createdAt?: string }) {
    const authData = this.get('authData') as any;
    if (authData) {
      authData.user = { ...authData.user, ...profile };
      this.set('authData', authData);
    }
  }

  // obtener información del perfil completa
  static getUserProfile(): { firstName: string; lastName: string; email?: string; phone?: string; createdAt?: string; userId?: string; role?: string } | null {
    const authData = this.get('authData') as any;
    return authData?.user || null;
  }

  // obtener nombre completo del usuario
  static getUserFullName(): string {
    const user = this.getUserProfile();
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return '';
  }

  // verificar si el usuario tiene un rol específico
  static hasRole(role: string): boolean {
    const roles = this.getRoles();
    return roles.includes(role);
  }

  // verificar si el usuario tiene alguno de los roles especificados
  static hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(role => userRoles.includes(role));
  }

  // verificar si el usuario es administrador (ADMIN o SYSADMIN)
  static isAdmin(): boolean {
    const userRoles = this.getRoles();
    return userRoles.includes('ADMIN') || userRoles.includes('SYSADMIN');
  }

  // limpiar un item específico
  static removeItem(key: string) {
    if (this.isLocalStorageAvailable()) {
      localStorage.removeItem(key);
    }
  }

  // verificar si el token es válido (básico)
  static isValidToken(token: string): boolean {
    try {
      // Verificar formato básico del token JWT
      const parts = token.split('.');
      if (parts.length !== 3) {
        return false;
      }

      // Verificar que el payload sea decodable
      const payload = JSON.parse(atob(parts[1]));

      // Verificar que el token no esté expirado
      const now = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < now) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  }

  // verificar si el usuario está logueado (optimizado)
  static isLoggedIn(): boolean {
    // Primero verificar si tenemos authData guardado (más rápido)
    const authData = this.get('authData') as any;
    if (!authData || !authData.accessToken) {
      return false;
    }

    // Validar token solo si es necesario
    return this.isValidToken(authData.accessToken);
  }

  // obtener el token de acceso (optimizado)
  static getAccessToken(): string | null {
    // Obtener de authData primero (más rápido)
    const authData = this.get('authData') as any;
    return authData?.accessToken || this.get('accessToken');
  }

  // obtener el refresh token (optimizado)
  static getRefreshToken(): string | null {
    // Obtener de authData primero (más rápido)
    const authData = this.get('authData') as any;
    return authData?.refreshToken || this.get('refreshToken');
  }
}

