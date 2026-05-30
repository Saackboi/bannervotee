import { Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-background-ambient',
  standalone: true,
  template: `
    <div class="ambient-bg">
      <div
        class="ambient-spotlight"
        [style.--spotlight-offset]="spotlightOffset()"
        aria-hidden="true"
      ></div>
      <div class="ambient-glow ambient-glow--blue" aria-hidden="true"></div>
      <div class="ambient-glow ambient-glow--gold" aria-hidden="true"></div>

      @for (p of particles; track $index) {
        <span
          class="ambient-particle"
          [style]="{
            '--x': p.x,
            '--y': p.y,
            '--s': p.size + 'px',
            '--d': p.delay + 's',
            '--c': p.color,
          }"
          aria-hidden="true"
        ></span>
      }
    </div>
  `,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
        isolation: isolate;
      }

      .ambient-bg {
        position: relative;
        width: 100%;
        height: 100%;
      }

      .ambient-spotlight {
        position: absolute;
        top: 42%;
        left: 50%;
        width: min(90vw, 50rem);
        height: min(90vw, 50rem);
        transform:
          translate(calc(-50% + var(--spotlight-offset, 0rem)), -50%);
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(255, 255, 255, 0.55) 0%,
          rgba(200, 225, 245, 0.08) 35%,
          transparent 65%
        );
        opacity: 0.7;
        transition:
          transform 520ms cubic-bezier(0.22, 1, 0.36, 1),
          opacity 800ms cubic-bezier(0.22, 1, 0.36, 1);
        will-change: transform, opacity;
      }

      .ambient-glow {
        position: absolute;
        border-radius: 50%;
        filter: blur(60px);
        will-change: transform, opacity;
      }

      .ambient-glow--blue {
        top: 10%;
        right: -5%;
        width: 35rem;
        height: 35rem;
        background: radial-gradient(
          circle,
          rgba(0, 73, 144, 0.06) 0%,
          transparent 65%
        );
        animation: ambient-drift 24s ease-in-out infinite;
      }

      .ambient-glow--gold {
        bottom: 5%;
        left: -5%;
        width: 30rem;
        height: 30rem;
        background: radial-gradient(
          circle,
          rgba(244, 186, 0, 0.04) 0%,
          transparent 55%
        );
        animation: ambient-drift 28s ease-in-out infinite reverse;
      }

      @keyframes ambient-drift {
        0%, 100% {
          transform: translate(0, 0) scale(1);
        }
        33% {
          transform: translate(3%, -4%) scale(1.06);
        }
        66% {
          transform: translate(-2%, 3%) scale(0.95);
        }
      }

      .ambient-particle {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: var(--s);
        height: var(--s);
        background: var(--c);
        border-radius: 999px;
        opacity: 0;
        animation: ambient-particle-float 22s var(--d) ease-in-out infinite;
        will-change: transform, opacity;
      }

      @keyframes ambient-particle-float {
        0% {
          opacity: 0;
          transform: translateY(0) translateX(0);
        }
        10% {
          opacity: 0.25;
        }
        30% {
          opacity: 0.15;
          transform: translateY(-1.5rem) translateX(1rem);
        }
        50% {
          opacity: 0.3;
        }
        70% {
          opacity: 0.12;
          transform: translateY(-3rem) translateX(-0.5rem);
        }
        90% {
          opacity: 0.2;
        }
        100% {
          opacity: 0;
          transform: translateY(-4.5rem) translateX(0.8rem);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .ambient-glow {
          animation: none;
        }

        .ambient-particle {
          display: none;
        }

        .ambient-spotlight {
          transition-duration: 1ms;
        }
      }
    `,
  ],
})
export class BackgroundAmbientComponent {
  readonly activeIndex = input(0);

  protected readonly spotlightOffset = signal('0rem');
  protected readonly particles = Array.from({ length: 8 }, (_, i) => {
    const colors = [
      'rgba(255, 255, 255, 0.3)',
      'rgba(200, 225, 245, 0.25)',
      'rgba(244, 186, 0, 0.15)',
    ];
    const sizes = [2, 3, 4, 3, 2.5];
    const quadrant = i % 4;

    return {
      x: `${8 + (quadrant % 2 === 0 ? 5 : 50) + (i * 6.5) % 35}%`,
      y: `${10 + (quadrant < 2 ? 5 : 45) + (i * 8.3) % 30}%`,
      delay: 0.5 + (i * 2.8) % 12,
      size: sizes[i % sizes.length],
      color: colors[i % colors.length],
    };
  });

  private prevIndex = 0;

  constructor() {
    effect(() => this.onIndexChange(this.activeIndex()));
  }

  private onIndexChange(val: number): void {
    const dir = val > this.prevIndex ? 1 : val < this.prevIndex ? -1 : 0;
    this.prevIndex = val;
    if (dir === 0) return;

    this.spotlightOffset.set(`${dir * 2}rem`);
    requestAnimationFrame(() => {
      this.spotlightOffset.set('0rem');
    });
  }
}
