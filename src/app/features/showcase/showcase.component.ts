import { AsyncPipe } from '@angular/common';
import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimationOptions, LottieComponent } from 'ngx-lottie';
import { Banner } from '../../core/models/banner.model';
import { AnimationService } from '../../core/services/animation.service';
import { AuthService } from '../../core/services/auth.service';
import { BannerService } from '../../core/services/banner.service';
import { SettingsService } from '../../core/services/settings.service';
import { VoteService } from '../../core/services/vote.service';
import { getOptimizedBannerAssetPath } from '../../shared/utils/banner-asset-path.utils';
import { getCreatorInitials } from '../../shared/utils/creator.utils';
import { VanillaTiltDirective } from '../../shared/vanilla-tilt.directive';

@Component({
  selector: 'app-showcase',
  imports: [AsyncPipe, LottieComponent, VanillaTiltDirective],
  templateUrl: './showcase.component.html',
  styleUrl: './showcase.component.css',
})
export class ShowcaseComponent {
  private readonly authService = inject(AuthService);
  private readonly voteService = inject(VoteService);
  private readonly animationService = inject(AnimationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private currentUserId = '';
  private readonly banners = signal<Banner[]>([]);
  private shuffledOnce = false;

  protected readonly settings$ = inject(SettingsService).settings$;
  protected readonly banners$ = inject(BannerService).activeBanners$;
  protected readonly hasVoted = signal(false);
  protected readonly voteSubmittedThisSession = signal(false);
  protected readonly loadingVote = signal(false);
  protected readonly message = signal('');
  protected readonly activeIndex = signal(0);
  protected readonly desktopViewport = signal(typeof window !== 'undefined' && window.innerWidth >= 1024);
  protected readonly zoomed = signal(false);
  protected readonly voteSuccessOptions: AnimationOptions = {
    path: '/assets/lottie/vote-success.json',
    loop: false,
    autoplay: true,
  };
  private touchStartX = 0;
  private lastCardTap = { index: -1, time: 0 };
  private readonly sessionReady: Promise<void>;
  private readonly focusResolved = signal(false);
  private readonly focusParam = this.route.snapshot.queryParamMap.get('focus');

  constructor() {
    this.sessionReady = this.startVisitorSession().catch(() => {
      this.currentUserId = '';
      this.hasVoted.set(false);
      this.message.set('No se pudo validar tu sesión. Recarga la página si deseas votar.');
    });

    this.banners$.subscribe((list) => {
      let ordered = list;
      if (!this.shuffledOnce) {
        ordered = [...list];
        for (let i = ordered.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [ordered[i], ordered[j]] = [ordered[j], ordered[i]];
        }
        this.shuffledOnce = true;
      }
      this.banners.set(ordered);
      this.sessionReady.then(() => this.resolveInitialFocus(list));
    });

    effect(() => {
      const list = this.banners();
      const idx = this.activeIndex();
      const banner = list[idx];
      if (banner?.id && this.focusResolved()) {
        const url = new URL(window.location.href);
        url.searchParams.set('focus', banner.id);
        history.replaceState(null, '', url.toString());
      }
    });
  }

  private resolveInitialFocus(list: Banner[]): void {
    if (this.focusParam) {
      const idx = list.findIndex((b) => b.id === this.focusParam);
      if (idx >= 0) {
        this.activeIndex.set(idx);
      }
    }
    this.focusResolved.set(true);
  }

  async voteFor(banner: Banner): Promise<void> {
    if (this.loadingVote() || this.hasVoted()) {
      return;
    }

    this.loadingVote.set(true);
    this.message.set('');

    try {
      await this.sessionReady;

      if (!this.currentUserId) {
        throw new Error('No se pudo validar tu sesión. Recarga la página e intenta de nuevo.');
      }

      await this.voteService.vote(banner.id, this.currentUserId);
      this.hasVoted.set(true);
      this.voteSubmittedThisSession.set(true);
      this.message.set('Tu elección ha sido registrada.');
      this.animationService.launchVoteConfetti();
      await this.router.navigateByUrl('/ranking');
    } catch (error) {
      this.message.set(error instanceof Error ? error.message : 'No se pudo registrar el voto.');
    } finally {
      this.loadingVote.set(false);
    }
  }

  async goToRanking(): Promise<void> {
    if (!this.hasVoted()) {
      return;
    }

    await this.router.navigateByUrl('/ranking');
  }

  setActiveIndex(index: number): void {
    this.zoomed.set(false);
    this.activeIndex.set(index);
  }

  onCardClick(index: number): void {
    if (index !== this.activeIndex()) {
      this.lastCardTap = { index: -1, time: 0 };
      this.setActiveIndex(index);
      return;
    }

    const now = Date.now();
    const isDoubleTap = this.lastCardTap.index === index && now - this.lastCardTap.time < 340;
    this.lastCardTap = { index, time: now };

    if (isDoubleTap) {
      this.toggleZoom();
    }
  }

  toggleZoom(): void {
    this.zoomed.update((zoomed) => !zoomed);
  }

  exitZoom(): void {
    this.zoomed.set(false);
  }

  previous(total: number): void {
    if (!total) {
      return;
    }

    this.exitZoom();
    this.activeIndex.update((index) => (index - 1 + total) % total);
  }

  next(total: number): void {
    if (!total) {
      return;
    }

    this.exitZoom();
    this.activeIndex.update((index) => (index + 1) % total);
  }

  onTouchStart(event: TouchEvent): void {
    if (this.zoomed()) {
      return;
    }

    this.touchStartX = event.touches[0]?.clientX ?? 0;
  }

  onTouchEnd(event: TouchEvent, total: number): void {
    if (this.zoomed()) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX ?? this.touchStartX;
    const delta = touchEndX - this.touchStartX;

    if (Math.abs(delta) < 35) {
      return;
    }

    if (delta > 0) {
      this.previous(total);
    } else {
      this.next(total);
    }
  }

  offsetFor(index: number): number {
    return index - this.activeIndex();
  }

  shouldLoadImage(index: number): boolean {
    const visibleRange = this.desktopViewport() ? 3 : 1;
    return Math.abs(this.offsetFor(index)) <= visibleRange;
  }

  imageUrlFor(banner: Banner): string {
    return getOptimizedBannerAssetPath(banner.imageUrl);
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.desktopViewport.set(window.innerWidth >= 1024);
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    this.exitZoom();
  }

  initialsFor(name: string): string {
    return getCreatorInitials(name);
  }

  private async startVisitorSession(): Promise<void> {
    const user = await this.authService.ensureAnonymousSession();
    await user.getIdToken();
    this.currentUserId = user.uid;

    try {
      this.hasVoted.set(await this.voteService.hasVoted(user.uid));
    } catch {
      this.hasVoted.set(false);
    }
  }
}
