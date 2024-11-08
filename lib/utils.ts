import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRandomTwoItems<T>(array: Array<T>): Array<T> {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 2);
}
