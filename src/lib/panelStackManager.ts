/**
 * Global Stacked Panel Manager (SSOT for Panel/Modal Stacking & Close Ordering)
 * Manages LIFO (Last-In, First-Out) pop order for both ESC key and Mobile Hardware/Browser Back buttons.
 */

type CloseHandler = () => void | Promise<void>;

interface PanelStackItem {
  id: string;
  close: CloseHandler;
  priority?: number; // Higher number = closes first
}

class PanelStackManager {
  private stack: PanelStackItem[] = [];
  private historyPushedCount = 0;
  private isPoppingFromHistory = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', this.handleKeyDown, true);
      window.addEventListener('popstate', this.handlePopState);
    }
  }

  /**
   * Register a panel or sub-panel when opened.
   */
  public push(id: string, close: CloseHandler, priority: number = 0): () => void {
    // Prevent duplicate registration of the same ID
    this.stack = this.stack.filter((item) => item.id !== id);
    this.stack.push({ id, close, priority });

    // Push browser history state for mobile back button interception
    try {
      if (typeof window !== 'undefined' && window.history) {
        window.history.pushState({ panelId: id, timestamp: Date.now() }, '');
        this.historyPushedCount++;
      }
    } catch {}

    // Return cleanup / unregister function
    return () => {
      this.remove(id);
    };
  }

  /**
   * Unregister a panel without triggering close (e.g. when closed normally via UI button)
   */
  public remove(id: string): void {
    const idx = this.stack.findIndex((item) => item.id === id);
    if (idx !== -1) {
      this.stack.splice(idx, 1);
    }
  }

  /**
   * Pop and execute the topmost panel's close handler.
   * Returns true if a panel was closed, false if stack was empty.
   */
  public pop(): boolean {
    if (this.stack.length === 0) return false;

    // Pop the topmost item (LIFO)
    const topItem = this.stack.pop();
    if (topItem) {
      try {
        topItem.close();
      } catch (err) {
        console.error('Failed to close panel from stack:', err);
      }
      return true;
    }
    return false;
  }

  /**
   * Global Keyboard ESC handler - strictly closes only the topmost panel
   */
  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (this.stack.length > 0) {
        e.preventDefault();
        e.stopPropagation();
        this.pop();
      }
    }
  };

  /**
   * Global popstate handler (Mobile hardware/browser back button)
   */
  private handlePopState = (e: PopStateEvent) => {
    if (this.stack.length > 0) {
      this.isPoppingFromHistory = true;
      const closed = this.pop();
      if (closed) {
        // Prevent default navigation
        if (e.preventDefault) e.preventDefault();
      }
      this.isPoppingFromHistory = false;
    }
  };

  /**
   * Check if any panels are open
   */
  public hasOpenPanels(): boolean {
    return this.stack.length > 0;
  }
}

export const panelStack = new PanelStackManager();
