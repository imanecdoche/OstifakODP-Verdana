/**
 * Helper to compute global floating context menu position (for position: fixed).
 * Accounts for CSS zoom on html (e.g. zoom: 0.8) and enforces viewport boundaries.
 */

export function getHtmlZoomFactor(): number {
  if (typeof window === 'undefined') return 1;
  const rawZoom = (window.getComputedStyle(document.documentElement) as any).zoom;
  const parsed = parseFloat(rawZoom);
  return !isNaN(parsed) && parsed > 0 ? parsed : 1;
}

export function computeFloatingMenuPositionFromPoint(
  clientX: number,
  clientY: number,
  menuWidth = 220,
  menuHeight = 160,
  padding = 16
): { x: number; y: number } {
  const zoom = getHtmlZoomFactor();
  
  // Screen/viewport size in zoomed coordinate space
  const viewportWidth = window.innerWidth / zoom;
  const viewportHeight = window.innerHeight / zoom;

  // Mouse coords in zoomed coordinate space
  const mouseX = clientX / zoom;
  const mouseY = clientY / zoom;

  let x = mouseX;
  let y = mouseY;

  // Boundary check: right edge
  if (x + menuWidth > viewportWidth - padding) {
    x = Math.max(padding, mouseX - menuWidth);
  }

  // Boundary check: bottom edge
  if (y + menuHeight > viewportHeight - padding) {
    y = Math.max(padding, mouseY - menuHeight);
  }

  return { x: Math.round(x), y: Math.round(y) };
}

export function computeFloatingMenuPositionFromRect(
  rect: DOMRect,
  menuWidth = 220,
  menuHeight = 160,
  padding = 16
): { x: number; y: number } {
  const zoom = getHtmlZoomFactor();

  // Screen/viewport size in zoomed coordinate space
  const viewportWidth = window.innerWidth / zoom;
  const viewportHeight = window.innerHeight / zoom;

  // Rect coords in zoomed coordinate space
  const rRight = rect.right / zoom;
  const rLeft = rect.left / zoom;
  const rBottom = rect.bottom / zoom;
  const rTop = rect.top / zoom;

  // Default: align with right edge of button, just below button
  let x = rRight - menuWidth;
  if (x < padding) {
    x = Math.min(rLeft, viewportWidth - menuWidth - padding);
  }
  if (x + menuWidth > viewportWidth - padding) {
    x = viewportWidth - menuWidth - padding;
  }
  x = Math.max(padding, x);

  let y = rBottom + 6;
  if (y + menuHeight > viewportHeight - padding) {
    y = Math.max(padding, rTop - menuHeight - 6);
  }

  return { x: Math.round(x), y: Math.round(y) };
}
