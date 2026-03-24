import { Injectable, signal } from '@angular/core';

export interface ToastData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts = signal<ToastData[]>([]);

  show(title: string, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 3000) {
    const toast: ToastData = { title, message, type, duration };
    this.toasts.update(current => [...current, toast]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }
  }

  remove(toast: ToastData) {
    this.toasts.update(current => current.filter(t => t !== toast));
  }
}
