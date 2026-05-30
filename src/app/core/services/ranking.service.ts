import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Banner } from '../models/banner.model';
import { BannerService } from './banner.service';

@Injectable({ providedIn: 'root' })
export class RankingService {
  private readonly bannerService = inject(BannerService);

  readonly ranking$: Observable<Banner[]> = this.bannerService.activeBanners$.pipe(
    map((banners) => [...banners].sort((a, b) => b.votes - a.votes)),
  );
}
