import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly authService = inject(AuthService);

  isCurrentUserAdmin(): Promise<boolean> {
    return this.authService.isCurrentUserAdmin();
  }

  logout(): Promise<void> {
    return this.authService.logout();
  }
}
