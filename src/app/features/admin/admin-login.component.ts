import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.css',
})
export class AdminLoginComponent {
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly loading = signal(false);
  protected readonly error = signal('');
  protected readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid || this.loading()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      const { email, password } = this.form.getRawValue();
      await this.authService.loginAdmin(email, password);

      if (!(await this.authService.isCurrentUserAdmin())) {
        await this.authService.logout();
        this.error.set('Este usuario no está autorizado como administrador.');
        return;
      }

      await this.router.navigateByUrl('/admin');
    } catch (error) {
      this.error.set(this.getLoginErrorMessage(error));
    } finally {
      this.loading.set(false);
    }
  }

  private getLoginErrorMessage(error: unknown): string {
    if (!(error instanceof FirebaseError)) {
      return 'No se pudo iniciar sesión. Inténtalo nuevamente.';
    }

    const messages: Record<string, string> = {
      'auth/invalid-credential': 'Correo o contraseña incorrectos, o el usuario no existe en este proyecto Firebase.',
      'auth/user-not-found': 'No existe un usuario con ese correo en este proyecto Firebase.',
      'auth/wrong-password': 'La contraseña no coincide con este usuario.',
      'auth/operation-not-allowed': 'El proveedor Email/Password no está habilitado en Firebase Authentication.',
      'auth/api-key-not-valid': 'La apiKey de Firebase no es válida. Revisa environment.ts.',
      'auth/invalid-api-key': 'La apiKey de Firebase no es válida. Revisa environment.ts.',
      'auth/network-request-failed': 'No se pudo conectar con Firebase Auth. Revisa red, bloqueadores o firewall.',
      'permission-denied': 'Firebase denegó la lectura de admins/{uid}. Revisa las reglas de Firestore.',
      'unavailable': 'Firestore no está disponible en este momento o la conexión fue bloqueada.',
    };

    return messages[error.code] ?? 'No se pudo iniciar sesión. Verifica la configuración de Firebase.';
  }
}
