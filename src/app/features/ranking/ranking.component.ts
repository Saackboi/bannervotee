import { AsyncPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { RankingService } from '../../core/services/ranking.service';
import { VoteService } from '../../core/services/vote.service';

@Component({
  selector: 'app-ranking',
  imports: [AsyncPipe],
  templateUrl: './ranking.component.html',
  styleUrl: './ranking.component.css',
})
export class RankingComponent {
  private readonly authService = inject(AuthService);
  private readonly voteService = inject(VoteService);
  private readonly router = inject(Router);

  protected readonly banners$ = inject(RankingService).ranking$;

  protected readonly shareMessage = signal('');

  constructor() {
    void this.ensureVotedAccess();
  }

  async shareResults(): Promise<void> {
    const shareData = {
      title: 'UTP Coclé Showcase',
      text: 'Mira el ranking de diseños del aniversario UTP Coclé.',
      url: window.location.origin,
    };

    if (navigator.share) {
      await navigator.share(shareData);
      return;
    }

    await navigator.clipboard.writeText(shareData.url);
    this.shareMessage.set('Link de resultados copiado.');
  }

  async backToGallery(): Promise<void> {
    await this.router.navigateByUrl('/');
  }

  private async ensureVotedAccess(): Promise<void> {
    try {
      const user = await this.authService.ensureAnonymousSession();
      const hasVoted = await this.voteService.hasVoted(user.uid);

      if (!hasVoted) {
        await this.router.navigateByUrl('/');
      }
    } catch {
      await this.router.navigateByUrl('/');
    }
  }
}
