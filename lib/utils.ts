import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function resolveUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}