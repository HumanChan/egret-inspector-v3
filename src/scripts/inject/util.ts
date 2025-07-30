// Inject script utilities

export function log(message: string, data?: any) {
  console.log(`[Hello World Extension Inject] ${message}`, data || '');
}

export function warn(message: string, data?: any) {
  console.warn(`[Hello World Extension Inject] ${message}`, data || '');
}

export function error(message: string, data?: any) {
  console.error(`[Hello World Extension Inject] ${message}`, data || '');
}

export function isDevMode(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function getCurrentUrl(): string {
  return window.location.href;
}

export function getPageTitle(): string {
  return document.title;
} 