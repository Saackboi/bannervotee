import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BANNER_STATUS_OPTIONS } from '../../core/constants/banner.constants';
import { Banner, BannerStatus } from '../../core/models/banner.model';
import { AdminService } from '../../core/services/admin.service';
import { BannerService } from '../../core/services/banner.service';
import { RankingService } from '../../core/services/ranking.service';
import { SettingsService } from '../../core/services/settings.service';
import { StatusLabelPipe } from '../../shared/pipes/status-label.pipe';
import { getBannerAssetPath } from '../../shared/utils/banner-asset-path.utils';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AsyncPipe, ReactiveFormsModule, RouterLink, StatusLabelPipe],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent {
  private readonly adminService = inject(AdminService);
  private readonly bannerService = inject(BannerService);
  private readonly rankingService = inject(RankingService);
  private readonly settingsService = inject(SettingsService);
  private readonly formBuilder = inject(FormBuilder);

  protected readonly banners$ = this.bannerService.allBanners$;
  protected readonly ranking$ = this.rankingService.ranking$;
  protected readonly settings$ = this.settingsService.settings$;
  protected readonly saving = signal(false);
  protected readonly statusOptions: BannerStatus[] = BANNER_STATUS_OPTIONS;

  protected readonly bannerForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required]],
    creatorName: ['', [Validators.required]],
    imageUrl: ['/banners/', [Validators.required]],
    status: ['pending' as BannerStatus, [Validators.required]],
  });

  async createBanner(): Promise<void> {
    if (this.bannerForm.invalid || this.saving()) {
      this.bannerForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    try {
      const formData = this.bannerForm.getRawValue();
      await this.bannerService.createBanner({
        ...formData,
        imageUrl: this.normalizeBannerImagePath(formData.imageUrl),
      });

      this.bannerForm.reset({ title: '', creatorName: '', imageUrl: '/banners/', status: 'pending' });
    } finally {
      this.saving.set(false);
    }
  }

  updateStatus(banner: Banner, status: BannerStatus): Promise<void> {
    return this.bannerService.updateStatus(banner.id, status);
  }

  deleteBanner(banner: Banner): Promise<void> {
    return this.bannerService.deleteBanner(banner);
  }

  toggleSetting(key: 'showcaseOpen' | 'votingOpen' | 'showRankingAfterVote', value: boolean): Promise<void> {
    return this.settingsService.updateSettings({ [key]: value });
  }

  updateGroupName(groupName: string): Promise<void> {
    return this.settingsService.updateSettings({ groupName });
  }

  logout(): Promise<void> {
    return this.adminService.logout();
  }

  private normalizeBannerImagePath(value: string): string {
    if (value.startsWith('/banners/')) {
      return value;
    }

    return getBannerAssetPath(value);
  }
}
