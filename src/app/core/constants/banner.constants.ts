import { BannerStatus } from '../models/banner.model';

export const BANNER_STATUS_OPTIONS: BannerStatus[] = ['pending', 'active', 'inactive', 'rejected'];

export const BANNER_STATUS_LABELS: Record<BannerStatus, string> = {
  pending: 'Pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
  rejected: 'Rechazado',
};
