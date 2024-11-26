import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomTwoItems<T>(array: Array<T>): Array<T> {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}

export function getFormattedDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}-${minutes}-${seconds}`;
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
