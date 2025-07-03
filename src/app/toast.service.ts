import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private counter = 0;

  show(message: string, type: Toast['type'] = 'info', title = '') {
    const toast: Toast = {
      id: this.counter++,
      message,
      type,
      title,
    };

    const updated = [...this.toastsSubject.value, toast];
    this.toastsSubject.next(updated);

    setTimeout(() => this.remove(toast.id), 3000);
  }

  remove(id: number) {
    const updated = this.toastsSubject.value.filter(t => t.id !== id);
    this.toastsSubject.next(updated);
  }
}


