import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind class 合併工具，避免類名衝突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
