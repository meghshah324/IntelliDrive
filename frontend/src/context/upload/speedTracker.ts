/**
 * upload/speedTracker.ts
 * ─────────────────────────────────────────────────────────
 * WHY: Isolates the speed-calculation algorithm into a pure,
 * testable module with no React dependency. Tracks per-item
 * byte samples and computes instantaneous speed.
 */

interface Sample {
  bytes: number;
  ts: number;
}

/** Minimum elapsed ms between speed recalculations. */
const SAMPLE_INTERVAL_MS = 250;

export class SpeedTracker {
  private samples = new Map<string, Sample>();

  /**
   * Returns the current speed (bytes/sec) for the given item.
   * If not enough time has passed since the last sample, returns
   * the provided `fallbackSpeed` (typically the item's current speed).
   */
  calculate(id: string, loadedBytes: number, fallbackSpeed: number): number {
    const now = Date.now();
    const prev = this.samples.get(id);

    if (!prev) {
      this.samples.set(id, { bytes: loadedBytes, ts: now });
      return 0;
    }

    const elapsed = now - prev.ts;
    if (elapsed > SAMPLE_INTERVAL_MS) {
      const speed = ((loadedBytes - prev.bytes) / elapsed) * 1000;
      this.samples.set(id, { bytes: loadedBytes, ts: now });
      return speed;
    }

    return fallbackSpeed;
  }

  reset(id: string): void {
    this.samples.delete(id);
  }

  clear(): void {
    this.samples.clear();
  }
}
