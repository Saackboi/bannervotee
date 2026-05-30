import { Injectable } from '@angular/core';
import confetti from 'canvas-confetti';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  launchVoteConfetti(): void {
    const colors = ['#003B71', '#FDB913', '#FFFFFF', '#00AEEF'];

    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.75 },
      colors,
    });

    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.75 },
      colors,
    });

    confetti({
      particleCount: 60,
      spread: 90,
      startVelocity: 28,
      origin: { y: 0.65 },
      colors,
    });
  }
}
