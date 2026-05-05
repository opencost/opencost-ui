import { checkCustomWindow } from "~/lib/legacy-util";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function formatUtcInstant(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}T${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())}Z`;
}

export function buildWindowParam(start: Date, end: Date): string {
  return `${formatUtcInstant(start)},${formatUtcInstant(end)}`;
}

function utcDayBounds(y: number, monthIndex: number, day: number): { start: Date; end: Date } {
  const start = new Date(Date.UTC(y, monthIndex, day, 0, 0, 0, 0));
  const end = new Date(Date.UTC(y, monthIndex, day, 23, 59, 59, 0));
  return { start, end };
}

export function getTodayUtcRange(): string {
  const now = new Date();
  const { start, end } = utcDayBounds(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return buildWindowParam(start, end);
}

export function getYesterdayUtcRange(): string {
  const now = new Date();
  const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const { start, end } = utcDayBounds(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate());
  return buildWindowParam(start, end);
}

export function getLastNDaysUtcInclusive(n: number): string {
  const now = new Date();
  const end = utcDayBounds(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ).end;
  const startDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - (n - 1)),
  );
  const start = utcDayBounds(
    startDay.getUTCFullYear(),
    startDay.getUTCMonth(),
    startDay.getUTCDate(),
  ).start;
  return buildWindowParam(start, end);
}

function rollingHoursRange(hours: number): string {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  return buildWindowParam(start, end);
}

export type ReportWindowPresetId =
  | "yesterday"
  | "today"
  | "last7"
  | "last14"
  | "last30"
  | "custom";

export const REPORT_WINDOW_PRESETS: {
  id: Exclude<ReportWindowPresetId, "custom">;
  label: string;
  build: () => string;
}[] = [
  { id: "yesterday", label: "Yesterday", build: getYesterdayUtcRange },
  { id: "today", label: "Today", build: getTodayUtcRange },
  { id: "last7", label: "Last 7 days", build: () => getLastNDaysUtcInclusive(7) },
  { id: "last14", label: "Last 14 days", build: () => getLastNDaysUtcInclusive(14) },
  { id: "last30", label: "Last 30 days", build: () => getLastNDaysUtcInclusive(30) },
];

const LEGACY_SHORTHAND: Record<string, () => string> = {
  today: getTodayUtcRange,
  yesterday: getYesterdayUtcRange,
  "24h": () => rollingHoursRange(24),
  "48h": () => rollingHoursRange(48),
  "7d": () => getLastNDaysUtcInclusive(7),
  "14d": () => getLastNDaysUtcInclusive(14),
};

/** If `window` is a legacy preset string, returns the equivalent UTC range param. */
export function legacyReportWindowToUtcRange(window: string): string | null {
  if (checkCustomWindow(window)) return null;
  const builder = LEGACY_SHORTHAND[window];
  return builder ? builder() : null;
}

export function parseReportWindowRange(
  window: string,
): { start: Date; end: Date } | null {
  if (!checkCustomWindow(window)) return null;
  const parts = window.split(",");
  if (parts.length !== 2) return null;
  const start = new Date(parts[0].trim());
  const end = new Date(parts[1].trim());
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  return { start, end };
}

export function detectReportWindowPresetId(window: string): ReportWindowPresetId {
  if (!checkCustomWindow(window)) {
    return "custom";
  }
  for (const p of REPORT_WINDOW_PRESETS) {
    if (p.build() === window) return p.id;
  }
  return "custom";
}

export function toUtcDateInputValue(d: Date): string {
  return `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;
}

export function buildUtcRangeFromDateInputs(startYmd: string, endYmd: string): string | null {
  const [ys, ms, ds] = startYmd.split("-").map(Number);
  const [ye, me, de] = endYmd.split("-").map(Number);
  if ([ys, ms, ds, ye, me, de].some((n) => Number.isNaN(n))) return null;
  const { start } = utcDayBounds(ys, ms - 1, ds);
  const { end } = utcDayBounds(ye, me - 1, de);
  if (start.getTime() > end.getTime()) return null;
  return buildWindowParam(start, end);
}
