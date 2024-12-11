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

export function getOrientation(width: number, height: number): "Landscape" | "Portrait" {
  const orientation = width / height;

  return orientation <= 16 / 9 && width > height ? "Landscape" : "Portrait";
}
