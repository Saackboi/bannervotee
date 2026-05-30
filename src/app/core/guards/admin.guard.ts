import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AdminService } from '../services/admin.service';

export const adminGuard: CanActivateFn = async () => {
  const adminService = inject(AdminService);
  const router = inject(Router);

  if (await adminService.isCurrentUserAdmin()) {
    return true;
  }

  return router.createUrlTree(['/admin/login']);
};
