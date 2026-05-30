import { Component } from '@angular/core';

@Component({
  selector: 'app-card-particles',
  standalone: true,
  template: `
    @for (p of particles; track $index) {
      <span
        class="particle"
        [style]="{
          '--x': p.x,
          '--y': p.y,
          '--d': p.delay + 's',
          '--s': p.size + 'px',
          '--c': p.color,
        }"
      ></span>
    }
  `,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
        z-index: 0;
        transform-style: flat;
      }

      .particle {
        position: absolute;
        left: var(--x);
        top: var(--y);
        width: var(--s);
        height: var(--s);
        background: var(--c);
        border-radius: 999px;
        opacity: 0;
        animation: particle-float 5s var(--d) ease-in-out infinite;
        will-change: transform, opacity;
      }

      @keyframes particle-float {
        0% {
          opacity: 0;
          transform: translateY(0) translateX(0) scale(0.6);
        }
        10% {
          opacity: 0.45;
        }
        30% {
          opacity: 0.3;
        }
        50% {
          opacity: 0.5;
          transform: translateY(-1.2rem) translateX(0.5rem) scale(1);
        }
        70% {
          opacity: 0.2;
        }
        90% {
          opacity: 0.35;
        }
        100% {
          opacity: 0;
          transform: translateY(-2.4rem) translateX(-0.3rem) scale(0.4);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .particle {
          display: none;
        }
      }
    `,
  ],
})
export class CardParticlesComponent {
  protected readonly particles = Array.from({ length: 14 }, (_, i) => {
    const colors = [
      'rgba(0, 43, 85, 0.35)',
      'rgba(0, 73, 144, 0.30)',
      'rgba(255, 255, 255, 0.35)',
      'rgba(244, 186, 0, 0.25)',
    ];
    const sizes = [2.5, 3, 4, 3.5, 2];
    const side = i < 7 ? 'left' : 'right';
    const xBase = side === 'left' ? -5 : 55;

    return {
      x: `${xBase + (i * 7.2) % 48}%`,
      y: `${5 + (i * 9.4) % 78}%`,
      delay: 0.3 + (i * 0.7) % 4.5,
      size: sizes[i % sizes.length],
      color: colors[i % colors.length],
    };
  });
}
