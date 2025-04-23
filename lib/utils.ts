import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomTwoItems<T>(array: Array<T>): Array<T> {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}

export function formatDateString(date: string | Date) {
  const localDate = new Date(date).toLocaleDateString();
  const [month, day, year] = localDate.split("/");

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

export function secondsToMMSS(seconds: number): string {
  const totalSeconds = Math.ceil(seconds);
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
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

export function imagesToRows(images: string[]): string[][] {
  const layoutMap: Record<number, number[]> = {
    1: [1],
    2: [1, 1],
    3: [1, 2],
    4: [2, 2],
    5: [3, 2],
    6: [3, 3],
  };

  const layout = layoutMap[images.length];
  const rows: string[][] = [];

  let index = 0;
  for (const count of layout) {
    const row: string[] = [];
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
