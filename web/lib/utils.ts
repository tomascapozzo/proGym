import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format seconds as mm:ss */
export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Format a date as a readable string */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

/** Compute Acute:Chronic Workload Ratio
 *  acute  = sum of load over last 7 days
 *  chronic = rolling 28-day average weekly load
 */
export function computeACWR(weeklyLoads: number[]): number {
  if (!weeklyLoads.length) return 0;
  const acute = weeklyLoads[weeklyLoads.length - 1] ?? 0;
  const chronic =
    weeklyLoads.slice(-4).reduce((a, b) => a + b, 0) /
    Math.min(weeklyLoads.length, 4);
  if (chronic === 0) return 0;
  return Math.round((acute / chronic) * 100) / 100;
}

export type ACWRStatus = "optimal" | "caution" | "risk" | "undertraining";

export function acwrStatus(ratio: number): ACWRStatus {
  if (ratio >= 1.5) return "risk";
  if (ratio >= 1.3) return "caution";
  if (ratio < 0.8) return "undertraining";
  return "optimal";
}

export const ACWR_COLORS: Record<ACWRStatus, string> = {
  optimal:      "var(--pg-green)",
  caution:      "var(--pg-amber)",
  risk:         "var(--pg-red)",
  undertraining:"var(--pg-blue)",
};
