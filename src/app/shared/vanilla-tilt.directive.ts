import { AfterViewInit, Directive, ElementRef, HostBinding, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';
import VanillaTilt, { HTMLVanillaTiltElement, TiltOptions } from 'vanilla-tilt';

@Directive({
  selector: '[appVanillaTiltActive]',
})
export class VanillaTiltDirective implements AfterViewInit, OnChanges, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLVanillaTiltElement>>(ElementRef);
  private viewReady = false;

  @Input() appVanillaTiltActive = false;
  @HostBinding('class.is-tilting') protected isTilting = false;

  ngAfterViewInit(): void {
    this.viewReady = true;
    this.syncTilt();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appVanillaTiltActive']) {
      this.syncTilt();
    }
  }

  ngOnDestroy(): void {
    this.destroyTilt();
  }

  onPointerEnter(event: PointerEvent): void {
    this.isTilting = true;
    this.forwardPointerAsMouse('mouseenter', event);
  }

  onPointerMove(event: PointerEvent): void {
    this.forwardPointerAsMouse('mousemove', event);
  }

  onPointerLeave(): void {
    this.isTilting = false;
  }

  private syncTilt(): void {
    if (!this.viewReady) {
      return;
    }

    if (!this.appVanillaTiltActive) {
      this.destroyTilt();
      return;
    }

    const element = this.elementRef.nativeElement;

    if (element.vanillaTilt) {
      return;
    }

    VanillaTilt.init(element, this.tiltOptions());
    element.addEventListener('pointerenter', this.onPointerEnterBound);
    element.addEventListener('pointermove', this.onPointerMoveBound);
    element.addEventListener('pointerup', this.onPointerReleaseBound);
    element.addEventListener('pointercancel', this.onPointerReleaseBound);
    element.addEventListener('pointerleave', this.onPointerLeaveBound);
  }

  private destroyTilt(): void {
    const element = this.elementRef.nativeElement;
    this.isTilting = false;
    element.removeEventListener('pointerenter', this.onPointerEnterBound);
    element.removeEventListener('pointermove', this.onPointerMoveBound);
    element.removeEventListener('pointerup', this.onPointerReleaseBound);
    element.removeEventListener('pointercancel', this.onPointerReleaseBound);
    element.removeEventListener('pointerleave', this.onPointerLeaveBound);
    element.vanillaTilt?.destroy();
  }

  private readonly onPointerEnterBound = (event: PointerEvent) => this.onPointerEnter(event);
  private readonly onPointerMoveBound = (event: PointerEvent) => this.onPointerMove(event);
  private readonly onPointerLeaveBound = () => this.onPointerLeave();
  private readonly onPointerReleaseBound = () => {
    this.isTilting = false;
    this.resetInstantly();
  };

  private forwardPointerAsMouse(type: 'mouseenter' | 'mousemove', event: PointerEvent): void {
    if (event.pointerType === 'mouse') {
      return;
    }

    this.elementRef.nativeElement.dispatchEvent(
      new MouseEvent(type, {
        bubbles: true,
        clientX: event.clientX,
        clientY: event.clientY,
      }),
    );
  }

  private resetInstantly(): void {
    const element = this.elementRef.nativeElement;

    if (!element.vanillaTilt) {
      return;
    }

    element.style.transition = 'transform 260ms cubic-bezier(0.22, 1, 0.36, 1)';
    element.vanillaTilt.reset();
    window.setTimeout(() => {
      element.style.transition = '';
    }, 280);
  }

  private tiltOptions(): TiltOptions {
    return {
      max: 12,
      speed: 500,
      scale: 1.025,
      perspective: 1100,
      glare: true,
      'max-glare': 0.18,
      gyroscope: true,
      easing: 'cubic-bezier(.03,.98,.52,.99)',
    };
  }
}
