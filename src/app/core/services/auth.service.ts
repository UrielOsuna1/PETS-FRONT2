import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
// services
import { AppStorageServiceService } from './app-storage-service.service';
import { GatewayService } from './gateway.service';
// common
import { CommonResponseDTO } from '../dtos/common/common-response-dto';
// dtos
import { LoginRequestDTO } from '../dtos/auth/login-request-dto';
import { LoginResponseDTO } from '../dtos/auth/login-response-dto';
import { SessionInformationResponseDTO } from '../dtos/auth/session-information-response-dto';
import { RefreshTokenRequestDTO } from '../dtos/token/refresh-token-request-dto';
import { RegisterClientRequestDTO } from '../dtos/user/register-client-request-dto';
import { RegisterClientResponseDTO } from '../dtos/user/register-client-response-dto';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(
    private router: Router,
    private appStorageService: AppStorageServiceService,
    private gatewayService: GatewayService
  ) { }

  // login
  async login(request: LoginRequestDTO): Promise<boolean> {
    try {
      // respuesta de la peticion al gateway con timeout de 15 segundos
      const response = await this.gatewayService.post<CommonResponseDTO<LoginResponseDTO>>('auth_login', request);

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      // validacion de respuesta
      if (!response.success) {
        // no lanzar error, simplemente devolver false
        return false;
      }

      // datos de la respuesta
      const data = response.data;

      if (!data?.accessToken)
        throw new Error('Acceso denegado');

      // guardar los tokens
      AppStorageServiceService.login = response;

      // redirigir al home con mensaje de éxito
      this.router.navigate(['/main/home'], {
        queryParams: {
          message: 'login_exitoso'
        }
      });

      return true;
    } catch {
      return false;
    }
  }

  // obtener token actual
  token(): string | null {
    return AppStorageServiceService.getAccessToken();
  }

  // refresh token
  async refreshToken(): Promise<boolean> {
    try {
      // obtener refresh token del storage
      const refreshToken = AppStorageServiceService.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      // preparar request para gateway
      const request: RefreshTokenRequestDTO = {
        refreshToken: refreshToken
      };

      // consumir endpoint de refresh a traves del gateway
      const response = await this.gatewayService.post<CommonResponseDTO<LoginResponseDTO>>('auth_refresh', request);

      if (!response?.success) {
        return false;
      }

      const data = response.data;
      if (!data?.accessToken || !data?.refreshToken) {
        return false;
      }

      // guardar los nuevos tokens
      AppStorageServiceService.login = response;

      return true;
    } catch {
      // si hay error, limpiar y redirigir al login
      AppStorageServiceService.clear();
      this.router.navigate(['/login']);
      return false;
    }
  }

  // logout
  async logout(): Promise<boolean> {
    try {
      // obtener el token actual
      const token = AppStorageServiceService.getAccessToken();

      if (token) {
        // consumir endpoint de logout a traves del gateway (sin data, con header)
        await this.gatewayService.postWithHeaders<any>('auth_logout', {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        });
      }

      // limpiar el storage PRIMERO
      AppStorageServiceService.clear();

      // redirigir al login con mensaje de éxito
      this.router.navigate(['/login'], {
        queryParams: {
          message: 'sesion_cerrada'
        },
        replaceUrl: true // Importante: reemplaza la URL actual
      });

      return true;
    } catch {
      // si hay error, igual limpiar y redirigir
      AppStorageServiceService.clear();
      this.router.navigate(['/login'], {
        replaceUrl: true
      });
      return false;
    }
  }

  // register
  async register(request: RegisterClientRequestDTO): Promise<CommonResponseDTO<RegisterClientResponseDTO> | null> {
    try {
      // respuesta de la peticion al gateway
      const response = await this.gatewayService.post<CommonResponseDTO<RegisterClientResponseDTO>>('auth_register', request);

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response;
    } catch (error) {
      return null;
    }
  }

  // obtener información de sesión
  async getSessionInfo(): Promise<CommonResponseDTO<SessionInformationResponseDTO> | null> {
    try {
      // respuesta de la peticion al gateway
      const response = await this.gatewayService.post<CommonResponseDTO<SessionInformationResponseDTO>>('auth_session_info', {});

      if (!response) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return response;
    } catch (error) {
      return null;
    }
  }
}
