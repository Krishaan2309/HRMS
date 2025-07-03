// auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent, HttpInterceptor, HttpHandler, HttpRequest
} from '@angular/common/http';
import { Observable, from } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Optionally: Add logic to only attach token to specific URLs
    const shouldAttachToken = req.url.startsWith(environment.apiUrl);

    if (!shouldAttachToken) {
      return next.handle(req);
    }

    return from(this.authService.getToken()).pipe(
      switchMap(token => {
        if (token) {
          const authReq = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          });
          return next.handle(authReq);
        } else {
          return next.handle(req); // continue without token if not available
        }
      })
    );
  }
}
