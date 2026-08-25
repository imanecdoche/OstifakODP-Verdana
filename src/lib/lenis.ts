import { useEffect } from 'react';
import Lenis from 'lenis';

let lenisInstance: Lenis | null = null;
let modalLockCount = 0;

export function getLenis(): Lenis | null {
  return lenisInstance;
}

/**
 * Locks page scroll (Lenis stop + native overflow hidden) while any popup/modal is open.
 * Safe for stacked modals via internal reference counting.
 */
export function useLenisModalLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    modalLockCount++;
    const apply = () => {
      const lenis = getLenis();
      if (modalLockCount > 0) {
        lenis?.stop();
        document.body.style.overflow = 'hidden';
      } else {
        lenis?.start();
        document.body.style.overflow = '';
      }
    };
    apply();

    return () => {
      modalLockCount--;
      apply();
    };
  }, [locked]);
}

/**
 * Official Lenis smooth scroll engine.
 * Prevent scrolling on specific containers via the native `data-lenis-prevent` attribute.
 */
export function useLenisSmoothScroll(enabled: boolean = true) {
  useEffect(() => {
    if (!enabled) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    lenisInstance = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, [enabled]);
}
