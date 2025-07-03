import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router
} from '@angular/router';
import { Observable, combineLatest, of, timer } from 'rxjs';
import { catchError, filter, map, take, switchMap, timeout } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { CandidateRepoService } from './candidate-repo.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router,
    private candidateRepoService: CandidateRepoService
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    
    console.log('🔍 RoleGuard canActivate called for:', state.url);
    
    return combineLatest([
      this.authService.isLoggedIn(),
      this.authService.isUserInfoReady(),
      this.authService.isUserAuthorized(), // 🔥 NEW: Check authorization status
      this.candidateRepoService.userInfo$
    ]).pipe(
      // Wait for authentication to be complete, but with timeout
      filter(([isLoggedIn, isUserReady, isAuthorized, userInfo]) => {
        console.log('🔍 RoleGuard filter check:', { 
          isLoggedIn, 
          isUserReady, 
          isAuthorized, 
          userInfo: !!userInfo 
        });
        
        // If not logged in, let it through immediately to redirect
        if (!isLoggedIn) {
          return true;
        }
        
        // If logged in, wait for user info to be ready AND authorization to be determined
        return isUserReady && isAuthorized !== null;
      }),
      take(1),
      timeout(5000), // 5 second timeout
      map(([isLoggedIn, isUserReady, isAuthorized, userInfo]) => {
        console.log('🔍 RoleGuard final check:', { 
          isLoggedIn, 
          isUserReady, 
          isAuthorized, 
          userInfo: !!userInfo 
        });
        
        if (!isLoggedIn) {
          console.log('❌ Not logged in, redirecting to login');
          return this.router.createUrlTree(['/login']);
        }

        // 🔥 UPDATED: Check authorization status first
        if (isAuthorized === false) {
          console.log('❌ User not authorized, redirecting to unauthorized');
          return this.router.createUrlTree(['/unauthorized']);
        }

        if (!userInfo) {
          console.log('❌ No user info available, redirecting to login');
          return this.router.createUrlTree(['/login']);
        }

        // 🔥 UPDATED: Double-check roles as backup (in case authorization status wasn't set properly)
        const allowedRoleIds = [4, 5];
        const roles = userInfo.roles ?? [];
        const hasAccess = roles.some(role => allowedRoleIds.includes(role.roleId));

        if (!hasAccess) {
          console.log('❌ Access denied based on roles, redirecting to unauthorized');
          // Update authorization status if it wasn't set correctly
          this.authService.setUserAuthorized(false);
          return this.router.createUrlTree(['/unauthorized']);
        }

        console.log('✅ Access granted');
        // Ensure authorization status is set correctly
        if (isAuthorized !== true) {
          this.authService.setUserAuthorized(true);
        }
        return true;
      }),
      catchError(err => {
        console.error('❌ RoleGuard Error:', err);
        // On timeout or error, redirect to login
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}