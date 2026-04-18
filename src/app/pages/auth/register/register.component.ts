import { Component, OnDestroy, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';

// shared
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { AlertComponent } from '../../../shared/components/alert/alert.component';

// services
import { AuthService } from '../../../core/services/auth.service';

// dtos
import { RegisterClientRequestDTO } from '../../../core/dtos/user/register-client-request-dto';

// Validador personalizado para contraseña fuerte
export function passwordStrengthValidator() {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
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

// Validador para confirmar contraseña
export function passwordMatchValidator(passwordField: string, confirmField: string) {
  return (group: AbstractControl): ValidationErrors | null => {
    const password = group.get(passwordField)?.value;
    const confirmPassword = group.get(confirmField)?.value;

    if (password !== confirmPassword) {
      group.get(confirmField)?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-register.component',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, CommonModule, RouterLink, InputComponent, ButtonComponent, AlertComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnDestroy {
  errorMessage = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  private messageTimer: any;

  registerForm: FormGroup;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/)]],
      lastName: ['', [Validators.required, Validators.maxLength(100), Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/)]],
      email: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(25),
        passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: passwordMatchValidator('password', 'confirmPassword') });
  }

  // getters para validaciones en el template
  get firstName() { return this.registerForm.get('firstName'); }
  get lastName() { return this.registerForm.get('lastName'); }
  get email() { return this.registerForm.get('email'); }
  get phone() { return this.registerForm.get('phone'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }

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
    }, 10000);
  }

  async onRegister() {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    // validar formulario
    if (this.registerForm.invalid) {
      this.errorMessage.set('Por favor, completa todos los campos correctamente.');
      this.autoHideMessages();
      return;
    }

    this.isLoading.set(true);

    try {
      // crear objeto de registro
      const registerRequest: RegisterClientRequestDTO = {
        firstName: this.registerForm.value.firstName!,
        lastName: this.registerForm.value.lastName!,
        email: this.registerForm.value.email!,
        password: this.registerForm.value.password!,
        confirmPassword: this.registerForm.value.confirmPassword!,
        phone: this.registerForm.value.phone || ''
      };

      // llamar al servicio de autenticación
      const response = await this.authService.register(registerRequest);

      if (response && response.success) {
        this.successMessage.set(response.message || 'Registro exitoso. Ahora puedes iniciar sesión.');
        this.autoHideMessages();

        // redirigir al login después de 2 segundos
        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: { message: 'registro_exitoso' }
          });
        }, 2000);
      } else {
        this.errorMessage.set(response?.message || 'Error al registrar. Intenta nuevamente.');
        this.autoHideMessages();
      }
    } catch (error: any) {
      this.errorMessage.set(error.message || 'Ocurrió un error al registrar. Inténtalo de nuevo');
      this.autoHideMessages();
    } finally {
      this.isLoading.set(false);
    }
  }
}
