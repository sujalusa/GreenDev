import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCO2(value: string): string {
  return value;
}

export function formatCost(value: string): string {
  return value;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    let processUrl = url.trim();
    if (!/^https?:\/\//i.test(processUrl)) {
      processUrl = 'https://' + processUrl;
    }
    const parsed = new URL(processUrl);
    if (!parsed.hostname.includes('github.com')) return null;
    
    let pathname = parsed.pathname.replace(/^\//, '').replace(/\/$/, '');
    pathname = pathname.replace(/\.git$/, ''); // remove .git if present
    
    const parts = pathname.split('/');
    if (parts.length < 2 || !parts[0] || !parts[1]) return null;
    return { owner: parts[0], repo: parts[1] };
  } catch {
    return null;
  }
}

export function isValidGitHubUrl(url: string): boolean {
  return parseGitHubUrl(url) !== null;
}
