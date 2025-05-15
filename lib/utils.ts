import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateString(date: string | Date) {
  if (!date) return "";

  const d = typeof date === "string" ? new Date(date) : date;

  if (isNaN(d.getTime())) return "";

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function formatDuration(seconds: number): string {
  const roundedSeconds = Math.ceil(seconds);
  const hrs = Math.floor(roundedSeconds / 3600);
  const mins = Math.floor((roundedSeconds % 3600) / 60);
  const secs = roundedSeconds % 60;

  return [
    hrs ? `${hrs}h` : "",
    mins ? `${hrs && mins < 10 ? "0" : ""}${mins}m` : hrs ? "00m" : "",
    `${hrs || mins ? (secs < 10 ? "0" : "") : ""}${secs}s`,
  ]
    .join("")
    .trim();
}

export function secondsToAdaptiveTime(seconds: number): string {
  const totalSeconds = Math.ceil(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
  } else {
    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
  }
}

export function formatTimerInputDisplay(input: string) {
  if (!input) return "";

  const digits = input.padStart(7, "0");
  const ms = digits.slice(-3);
  const s = digits.slice(-5, -3);
  const m = digits.length > 5 ? digits.slice(-7, -5) : "";
  const h = digits.length > 7 ? digits.slice(0, -7) : "";

  const parts = [];
  if (h) parts.push(h);
  if (m || h) parts.push(m || "00");
  parts.push(s);
  parts.push(ms);

  return parts.join(":");
}

export function toSeconds(input: string) {
  if (!input) return 0;

  const digits = input.padStart(7, "0");
  const ms = parseInt(digits.slice(-3)) / 1000;
  const s = parseInt(digits.slice(-5, -3));
  const m = digits.length > 5 ? parseInt(digits.slice(-7, -5)) : 0;
  const h = digits.length > 7 ? parseInt(digits.slice(0, -7)) : 0;

  return h * 3600 + m * 60 + s + ms;
}

export function fromSeconds(seconds: number) {
  if (seconds === 0) return "";

  const totalMs = Math.floor(seconds * 1000);
  const ms = totalMs % 1000;
  const s = Math.floor(totalMs / 1000) % 60;
  const m = Math.floor(totalMs / 60000) % 60;
  const h = Math.floor(totalMs / 3600000);

  let result = ms.toString().padStart(3, "0");
  result = s.toString().padStart(2, "0") + result;

  if (m > 0 || h > 0) {
    result = m.toString().padStart(2, "0") + result;
  }

  if (h > 0) {
    result = h.toString() + result;
  }

  return result;
}

export function getClampedDelta(absTime: number, duration: number, currentTime: number) {
  if (!Number.isFinite(absTime) || !Number.isFinite(duration) || !Number.isFinite(currentTime)) {
    return;
  }
  if (duration < 0) {
    return;
  }

  const clamped = Math.min(Math.max(absTime, 0), duration);
  const delta = clamped - currentTime;
  const hasMeaningfulChange = Math.abs(delta) > 0.05;
  return { clamped, delta, hasMeaningfulChange };
}

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function withDelay<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fn().then(resolve).catch(reject);
    }, ms);
  });
}

export const throttle = (func: (...args: any[]) => void, delay: number) => {
  let lastCall = 0;
  return (...args: any[]) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

export function formatFileSize(bytes: number): string {
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  const roundedSize = Math.ceil(size * 10) / 10;

  const formattedSize =
    roundedSize >= 100
      ? Math.ceil(roundedSize).toFixed(0)
      : roundedSize.toFixed(1).replace(/\.0$/, "");

  return `${formattedSize}${units[unitIndex]}`;
}

export function getOrientation({
  width,
  height,
}: {
  width: number;
  height: number;
}): "Landscape" | "Portrait" {
  return height > width ? "Portrait" : "Landscape";
}

export function splitFilename(filename: string): [string, string] {
  const lastDotIndex = filename.lastIndexOf(".");

  if (lastDotIndex === -1) {
    return [filename, "unknown"];
  }

  const name = filename.slice(0, lastDotIndex);
  const extension = filename.slice(lastDotIndex + 1);

  return [name, extension];
}

export function imagesToRows<T>(images: T[]): T[][] {
  const layoutMap: Record<number, number[]> = {
    1: [1],
    2: [1, 1],
    3: [1, 2],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
  };

  const layout = layoutMap[images.length];
  const rows: T[][] = [];

  let index = 0;
  for (const count of layout) {
    const row: T[] = [];
    for (let i = 0; i < count; i++) {
      row.push(images[index++]);
    }
    rows.push(row);
  }

  return rows;
}

export function getResolutionLabel({ width, height }: { width: number; height: number }): string {
  const res = Math.max(width, height);

  if (res >= 3840) return "2160p";
  if (res >= 1920) return "1080p";
  if (res >= 1280) return "720p";
  if (res >= 854) return "480p";
  return "360p";
}
