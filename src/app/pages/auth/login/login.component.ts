import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
// components
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
// services
import { AuthService } from '../../../core/services/auth.service';
import { AppStorageServiceService } from '../../../core/services/app-storage-service.service';
// dtos
import { LoginRequestDTO } from '../../../core/dtos/auth/login-request-dto';

// Validador personalizado para contraseña fuerte
export function passwordStrengthValidator() {
  return (control: any) => {
    const value = control.value;
    if (!value) {
      return null;
    }

    // Al menos una mayúscula
    const hasUpperCase = /[A-Z]/.test(value);
    // Al menos una minúscula
    const hasLowerCase = /[a-z]/.test(value);
    // Al menos un número
    const hasNumber = /\d/.test(value);
    // Al menos un carácter especial
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    // No contiene espacios
    const hasNoSpaces = !/\s/.test(value);

    const valid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar && hasNoSpaces;

    return valid ? null : {
      passwordStrength: {
        hasUpperCase,
        hasLowerCase,
        hasNumber,
        hasSpecialChar,
        hasNoSpaces
      }
    };
  };
}

@Component({
  selector: 'app-login.component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, InputComponent, ButtonComponent, AlertComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  private messageTimer: any;

  // getters para validaciones en el template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // formulario reactivo
  loginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
        passwordStrengthValidator()
      ]]
    });
  }

  ngOnInit() {
    // verificar si hay mensaje de sesión cerrada
    this.route.queryParams.subscribe(params => {
      if (params['message'] === 'sesion_cerrada') {
        this.successMessage.set('Sesión cerrada correctamente');

        // limpiar el query parameter
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: {},
          replaceUrl: true
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.clearMessageTimer();
  }

  private clearMessageTimer(): void {
    if (this.messageTimer) {
      clearTimeout(this.messageTimer);
      this.messageTimer = null;
    }
  }

  private autoHideMessages(): void {
    this.clearMessageTimer();
    this.messageTimer = setTimeout(() => {
      this.errorMessage.set(null);
      this.successMessage.set(null);
    }, 10000); // 10 segundos
  }

  async onLogin() {
    this.errorMessage.set('');
    this.successMessage.set('');

    // validar formulario
    if (this.loginForm.invalid) {
      this.errorMessage.set('Por favor, completa todos los campos correctamente.');
      this.autoHideMessages();
      return;
    }

    this.isLoading.set(true);

    try {
      // crear objeto de login
      const loginRequest: LoginRequestDTO = {
        email: this.loginForm.value.email!,
        password: this.loginForm.value.password!
      };

      // llamar al servicio de autenticación
      const success = await this.authService.login(loginRequest);

      if (success) {
        this.successMessage.set('Logeado correctamente');
        // redirigir según el rol
        setTimeout(() => {
          if (AppStorageServiceService.isAdmin()) {
            this.router.navigate(['/admin/admin-dashboard']);
          } else {
            this.router.navigate(['/main/home']);
          }
        }, 1000);
      } else {
        this.errorMessage.set('Credenciales incorrectas. Verifica tu email y contraseña');
      }
      this.autoHideMessages();
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Ocurrió un error al iniciar sesión. Inténtalo de nuevo');
      this.autoHideMessages();
    } finally {
      this.isLoading.set(false);
    }
  }
}
