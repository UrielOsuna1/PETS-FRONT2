import { Component, Input, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
// rutas
import { RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
// material
import { MatIconModule } from '@angular/material/icon';
// shared
import { ButtonComponent } from '../../../../shared/components/button/button.component';
// services
import { AppStorageServiceService } from '../../../../core/services/app-storage-service.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-top-menu',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonComponent, MatIconModule],
  templateUrl: './top-menu.component.html',
  styleUrls: ['./top-menu.component.css'],
})
export class TopMenuComponent implements OnInit, OnDestroy {
  @Input() user: any = null;

  isMenuOpen: boolean = false;
  private refreshInterval: any;
  private routerSubscription: Subscription | null = null;

  constructor(private cdr: ChangeDetectorRef, private authService: AuthService, private router: Router) { }

  ngOnInit() {
    // cargar información del usuario si no está disponible
    this.loadUserInfo();

    // escuchar eventos de navegación para actualizar cuando se regresa a una página
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.loadUserInfo();
        this.refresh();
      });
  }

  // cargar información del usuario
  async loadUserInfo() {
    // si no hay nombre en el storage, intentar cargar desde el perfil
    if (!AppStorageServiceService.getUserFullName() && AppStorageServiceService.isLoggedIn()) {
      try {
        // aquí podrías llamar al servicio de perfil si es necesario
        // por ahora solo forzamos actualización
        this.refresh();
      } catch (error) {
        // error silencioso
      }
    }
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  // obtener información del usuario logueado
  get userInfo() {
    return AppStorageServiceService.getUserInfo();
  }

  // obtener el nombre del usuario desde AppStorage
  get userName() {
    return AppStorageServiceService.getUserFullName();
  }

  // verificar si está logueado
  get isLoggedIn() {
    const logged = AppStorageServiceService.isLoggedIn();
    return logged;
  }

  // obtener ruta de perfil según el rol
  get profileLink(): string {
    if (AppStorageServiceService.isAdmin()) {
      return '/admin/admin-profile';
    }
    return '/main/profile';
  }

  // forzar actualización manual
  refresh() {
    this.cdr.detectChanges();
  }

  async handleLogout(): Promise<void> {
    // detener el intervalo de actualización para evitar conflictos
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // llamar al método logout del AuthService que ya hace todo
    await this.authService.logout();
  }
}
