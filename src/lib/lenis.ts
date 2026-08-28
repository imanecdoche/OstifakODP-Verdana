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
 * Compensates the scrollbar width to prevent layout shift / scrollbar jump.
 */
export function useLenisModalLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;

    modalLockCount++;

    const getScrollbarWidth = () =>
      Math.max(0, window.innerWidth - document.documentElement.clientWidth);

    const isTextField = (target: EventTarget | null) =>
      target instanceof HTMLElement &&
      (target.matches('input, textarea, select') || target.isContentEditable);
    const isMobile = () => window.matchMedia('(max-width: 767px)').matches;
    const setKeyboardVisible = (visible: boolean) =>
      document.documentElement.classList.toggle('keyboard-visible', isMobile() && visible);
    let viewportBaseline = window.visualViewport?.height ?? window.innerHeight;
    const onViewportResize = () => {
      const viewport = window.visualViewport;
      if (viewport) {
        viewportBaseline = Math.max(viewportBaseline, viewport.height);
      }
      const keyboardOpen = viewport
        ? viewportBaseline - viewport.height > 120 || window.innerHeight - viewport.height > 120
        : false;
      setKeyboardVisible(keyboardOpen);
    };
    const onFocusIn = (event: FocusEvent) => {
      if (!isTextField(event.target)) return;
      window.setTimeout(() => {
        (event.target as HTMLElement).scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });
      }, 250);
    };
    const onFocusOut = () => window.setTimeout(() => {
      if (!window.visualViewport) setKeyboardVisible(false);
      else onViewportResize();
    }, 150);
    let drag: { sheet: HTMLElement; startY: number; offset: number; top: number; height: number } | null = null;
    const getHandle = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return null;
      const handle = target.closest('[class*="w-10"][class*="h-1"]');
      return handle?.closest('[data-bottom-sheet]') ? handle : null;
    };
    const onPointerDown = (event: PointerEvent) => {
      const handle = getHandle(event.target);
      const sheet = handle?.closest('[data-bottom-sheet]');
      if (!handle || !sheet || event.pointerType === 'mouse' && event.button !== 0) return;
      const element = sheet as HTMLElement;
      const rect = element.getBoundingClientRect();
      drag = { sheet: element, startY: event.clientY, offset: 0, top: rect.top, height: rect.height };
      (handle as HTMLElement).setPointerCapture?.(event.pointerId);
      (sheet as HTMLElement).style.transition = 'none';
      event.preventDefault();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!drag) return;
      drag.offset = Math.max(-drag.top, Math.min(drag.height, event.clientY - drag.startY));
      drag.sheet.style.transform = `translateY(${drag.offset}px)`;
    };
    const onPointerUp = () => {
      if (!drag) return;
      const { sheet, offset, height, top } = drag;
      drag = null;
      sheet.style.transition = 'transform 360ms cubic-bezier(0.22, 1, 0.36, 1)';
      sheet.style.transform = offset > height * 0.25
        ? 'translateY(0)'
        : offset < -height * 0.25
          ? `translateY(${-top}px)`
          : 'translateY(0)';
      window.setTimeout(() => {
        if (sheet.isConnected) sheet.style.transition = '';
      }, 380);
    };
    const guardAutofill = () => {
      document.querySelectorAll<HTMLElement>('[data-bottom-sheet] form, [data-bottom-sheet] input, [data-bottom-sheet] textarea, [data-bottom-sheet] select').forEach((element) => {
        element.setAttribute('autocomplete', 'off');
        element.setAttribute('autocorrect', 'off');
        element.setAttribute('spellcheck', 'false');
        element.setAttribute('data-form-type', 'other');
        element.setAttribute('data-lpignore', 'true');
      });
    };
    const autofillObserver = new MutationObserver(guardAutofill);
    guardAutofill();
    autofillObserver.observe(document.body, { childList: true, subtree: true });

    const apply = () => {
      const lenis = getLenis();
      const body = document.body;

      if (modalLockCount > 0) {
        lenis?.stop();
        const sbw = getScrollbarWidth();
        body.style.overflow = 'hidden';
        // Reserve the scrollbar gutter so content doesn't reflow horizontally.
        if (sbw > 0) body.style.paddingRight = `${sbw}px`;
      } else {
        lenis?.start();
        body.style.overflow = '';
        body.style.paddingRight = '';
      }
    };
    apply();

    // Restore lock width compensation on resize while modal stays open.
    const onResize = () => apply();
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onViewportResize);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    document.addEventListener('pointerdown', onPointerDown, { passive: false });
    document.addEventListener('pointermove', onPointerMove, { passive: false });
    document.addEventListener('pointerup', onPointerUp);
    document.addEventListener('pointercancel', onPointerUp);
    onViewportResize();

    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onViewportResize);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerup', onPointerUp);
      document.removeEventListener('pointercancel', onPointerUp);
      autofillObserver.disconnect();
      modalLockCount--;
      if (modalLockCount === 0) setKeyboardVisible(false);
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
