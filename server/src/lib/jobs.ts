import { expireStaleUnpaidOrders } from "../services/order.service.js";
import { idempotencyService } from "../services/idempotency.service.js";

/**
 * Background maintenance jobs.
 *
 * These run in-process with `setInterval`, which is fine for a single
 * instance. If the API is ever scaled horizontally, move them to a single
 * dedicated worker (or pg_cron) so multiple instances don't duplicate work.
 * Every job here is idempotent, so duplicates would be wasteful, not wrong.
 */

const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

interface JobHandle {
  stop: () => void;
}

const runSafely = async (name: string, fn: () => Promise<unknown>) => {
  try {
    await fn();
  } catch (err) {
    console.error(`[Jobs] ${name} failed:`, err);
  }
};

/**
 * Cancel unpaid PENDING orders past their reservation window and return
 * their stock. Runs every minute. Orders are also expired lazily on read,
 * so this job is about promptness for stock, not correctness.
 */
const startOrderExpiryJob = (): JobHandle => {
  void runSafely("initial order expiry sweep", expireStaleUnpaidOrders);
  const interval = setInterval(() => {
    void runSafely("order expiry sweep", async () => {
      const cancelled = await expireStaleUnpaidOrders();
      if (cancelled > 0) {
        console.log(`[Jobs] Expired ${cancelled} stale unpaid order(s)`);
      }
    });
  }, ONE_MINUTE);
  interval.unref?.();
  return { stop: () => clearInterval(interval) };
};

/**
 * Delete expired idempotency records. Runs hourly; the initial sweep
 * removes any backlog on boot.
 */
const startIdempotencyPruneJob = (): JobHandle => {
  const prune = async () => {
    const result = await idempotencyService.pruneExpired();
    if (result.count > 0) {
      console.log(`[Jobs] Pruned ${result.count} expired idempotency key(s)`);
    }
  };

  void runSafely("initial idempotency prune", prune);
  const interval = setInterval(() => {
    void runSafely("idempotency prune", prune);
  }, ONE_HOUR);
  interval.unref?.();
  return { stop: () => clearInterval(interval) };
};

export const startBackgroundJobs = (): JobHandle[] => {
  if (process.env.NODE_ENV === "test" || process.env.DISABLE_JOBS === "true") {
    return [];
  }
  return [startOrderExpiryJob(), startIdempotencyPruneJob()];
};

export const stopBackgroundJobs = (jobs: JobHandle[]): void => {
  for (const job of jobs) job.stop();
};
