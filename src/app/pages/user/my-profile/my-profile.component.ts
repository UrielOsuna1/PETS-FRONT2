import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { mockAdoptionRequests, AdoptionRequest, PetImage } from '../../pets/pets-details/pets-details.component';
// components
import { AlertComponent } from '../../../shared/components/alert/alert.component';
// services
import { AuthService } from '../../../core/services/auth.service';
import { CryptoService } from '../../../core/services/crypto.service';
import { AppStorageServiceService } from '../../../core/services/app-storage-service.service';
// dtos
import { SessionInformationResponseDTO } from '../../../core/dtos/auth/session-information-response-dto';

@Component({
  selector: 'app-my-profile.component',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertComponent],
  templateUrl: './my-profile.component.html',
  styleUrl: './my-profile.component.css',
})
export class MyProfileComponent implements OnInit {
  // Signals for reactive state management
  user = signal<SessionInformationResponseDTO | null>(null);
  userRole = signal<string>('');
  userId = signal<string>('');
  userRequests = signal<AdoptionRequest[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  showCancelModal = false;
  requestToCancel: AdoptionRequest | null = null;

  constructor(
    private authService: AuthService,
    private cryptoService: CryptoService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    // Always try to load from backend first
    await this.loadSessionInfo();
    this.loadRequests();
  }

  async loadSessionInfo(): Promise<void> {
    try {
      this.isLoading.set(true);
      const sessionResponse: { success: boolean; data?: SessionInformationResponseDTO } | null = await this.authService.getSessionInfo();

      if (sessionResponse?.success && sessionResponse.data) {
        const sessionData = sessionResponse.data;

        // Decrypt sensitive fields
        const email = await this.cryptoService.decrypt(sessionData.email);
        const phone = sessionData.phone ? await this.cryptoService.decrypt(sessionData.phone) : '';
        const createdAt = await this.cryptoService.decrypt(sessionData.createdAt);

        // Get role and ID from JWT token
        const token = AppStorageServiceService.getAccessToken();
        const roleFromToken = token ? this.getRoleFromToken(token) : 'user';
        const userIdFromToken = token ? this.getUserIdFromToken(token) : '';

        this.user.set({
          firstName: sessionData.firstName,
          lastName: sessionData.lastName,
          email: email,
          phone: phone || '',
          createdAt: createdAt
        });
        this.userRole.set(roleFromToken);
        this.userId.set(userIdFromToken);
      } else {
        this.errorMessage.set('No se pudo cargar la información del perfil');
      }
    } catch (error: any) {
      // revisa si el token es invalido o expirado
      if (error.status === 401 || error.error?.errorCode === 'TOKEN_INVALID') {
        this.errorMessage.set('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        // limpia el token invalido y redirige al login despues de un breve delay
        setTimeout(() => {
          AppStorageServiceService.clear();
          this.router.navigate(['/login']);
        }, 2000);
      } else {
        this.errorMessage.set('Error al cargar la información del perfil. Por favor, verifica tu conexión.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  loadRequests(): void {
    const index = mockAdoptionRequests.findIndex((r: AdoptionRequest) => r.id === this.requestToCancel!.id);
  }

  // obtener id del usuario del token
  getUserIdFromToken(token: string): string {
    try {
      const payload = AppStorageServiceService.decodeToken(token);
      const userId = payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        || payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/nameidentifier']
        || payload['nameidentifier']
        || payload['sub']
        || payload['id']
        || payload['userId']
        || payload['user_id']
        || '';
      return userId;
    } catch {
      return '';
    }
  }

  // obtener rol del token
  getRoleFromToken(token: string): string {
    try {
      const payload = AppStorageServiceService.decodeToken(token);
      const role = payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
        || payload['role']
        || payload['roles']
        || 'user';
      return role;
    } catch {
      return 'user';
    }
  }

  // ocultar email
  maskEmail(email: string): string {
    const [local, domain] = email.split('@');
    const masked = local[0] + '***' + local[local.length - 1];
    return `${masked}@${domain}`;
  }

  // ocultar numero de telefono
  maskPhone(phone: string | undefined): string {
    if (!phone) return '';

    const digits = phone.replace(/\D/g, '');

    if (digits.length >= 7) {
      const first = digits.slice(0, 2);
      const last = digits.slice(-2);
      return `${first}****${last}`;
    }

    return phone;
  }

  getInitial(): string {
    const fullName = `${this.user()?.firstName || ''} ${this.user()?.lastName || ''}`.trim();
    return fullName ? fullName[0].toUpperCase() : '?';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pendiente': return 'status--pending';
      case 'Aprobada': return 'status--approved';
      case 'Rechazada': return 'status--rejected';
      default: return 'status--default';
    }
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'Pendiente': return '⏳';
      case 'Aprobada': return '✓';
      case 'Rechazada': return '✕';
      default: return '';
    }
  }

  getPrimaryImage(request: AdoptionRequest): string {
    const img = request.pet?.images.find((i: PetImage) => i.is_primary);
    return img?.image_url || request.pet?.images[0]?.image_url || '';
  }

  openCancelModal(request: AdoptionRequest): void {
    this.requestToCancel = request;
    this.showCancelModal = true;
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.requestToCancel = null;
  }

  confirmCancel(): void {
    if (this.requestToCancel) {
      const index = mockAdoptionRequests.findIndex((r: AdoptionRequest) => r.id === this.requestToCancel!.id);
      if (index !== -1) mockAdoptionRequests.splice(index, 1);
      this.closeCancelModal();
      this.loadRequests();
    }
  }
}
