import { Component, OnInit } from '@angular/core';
import { ToastService, Toast } from '../toast.service';

@Component({
  selector: 'app-toaster', // ✅ This is the selector
  templateUrl: './toaster.component.html',
  styleUrls: ['./toaster.component.css']
})
export class ToasterComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }


  remove(id: number) {
    this.toastService.remove(id);
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'assets/tick_circle.svg';
      case 'error':
        return 'assets/cancel.svg';
      case 'info':
        return 'assets/Info.svg';
        default:
          return 'assets/info.svg'; 
  }
}
}

