// Utility to keep screen awake (Screen Wake Lock API) for mobile reading and listening

class WakeLockManager {
  private sentinel: any = null;
  private isRequested: boolean = false;

  public isSupported(): boolean {
    return typeof navigator !== 'undefined' && 'wakeLock' in navigator;
  }

  public async requestLock(): Promise<boolean> {
    this.isRequested = true;
    if (!this.isSupported()) return false;
    try {
      if (!this.sentinel || this.sentinel.released) {
        this.sentinel = await (navigator as any).wakeLock.request('screen');
        this.sentinel.addEventListener('release', () => {
          // If released by OS (e.g., tab switch) and still requested, re-acquire when visible
          if (this.isRequested && document.visibilityState === 'visible') {
            this.reacquire();
          }
        });
      }
      return true;
    } catch (err) {
      console.warn('Wake Lock request failed:', err);
      return false;
    }
  }

  public async releaseLock(): Promise<void> {
    this.isRequested = false;
    if (this.sentinel) {
      try {
        await this.sentinel.release();
      } catch (err) {
        // ignore
      }
      this.sentinel = null;
    }
  }

  private async reacquire() {
    if (!this.isRequested) return;
    try {
      this.sentinel = await (navigator as any).wakeLock.request('screen');
    } catch (e) {
      // ignore
    }
  }
}

export const wakeLockManager = new WakeLockManager();
