import { Component, OnInit, Injector } from '@angular/core';
import { AuthService } from './auth.service';
import { CandidateRepoService } from './candidate-repo.service';
import { filter, firstValueFrom, Observable, take, timeout } from 'rxjs';
import { AuthUser } from 'src/modals/authUser';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  isLoggedIn$: Observable<boolean>;
  user: AuthUser | null = null;

  constructor(
    private authService: AuthService,
    private candidateRepoService: CandidateRepoService,
    private router: Router,
    private injector: Injector // 🔥 Add injector
  ) {
    this.isLoggedIn$ = this.authService.isLoggedIn();
    
    // 🔥 Set injector in auth service for dynamic service injection
    this.authService.setInjector(this.injector);
  }

  // 🔥 NEW: Helper method to check user authorization
  private checkUserAuthorization(userInfo: any): boolean {
    const allowedRoleIds = [4, 5];
    const roles = userInfo?.roles ?? [];
    return roles.some((role: any) => allowedRoleIds.includes(role.roleId));
  }

  async ngOnInit() {
    try {
      await this.authService.restoreAuthState();
      
      // Wait for auth state to be determined
      const [isLogged, user] = await Promise.all([
        firstValueFrom(this.authService.isLoggedIn()),
        firstValueFrom(
          this.authService.getUser().pipe(
            filter(u => u !== null), 
            take(1)
          ).pipe(
            // Add timeout to prevent infinite waiting
            timeout(5000)
          )
        ).catch(() => null) // Handle timeout gracefully
      ]);
      
      if (isLogged && user?.email) {
        this.user = user;
        try {
          console.log('🔄 Fetching server-side user info for:', user.email);
          await firstValueFrom(this.candidateRepoService.fetchAndStoreUserInfo(user.email));
          console.log('✅ Server-side user info restored');
          
          // 🔥 UPDATED: Check if user has required authorization
          const userInfo = this.candidateRepoService.getUserInfo();
          if (!userInfo || !this.checkUserAuthorization(userInfo)) {
            console.log('❌ User does not have required roles');
            this.authService.setUserAuthorized(false);
            
            // Don't complete login for unauthorized users
            // The RoleGuard will handle the redirect
            return;
          }
          
          console.log('✅ User authorized with required roles');
          this.authService.setUserAuthorized(true);
          
          // Mark authentication as complete
          this.authService.completeLogin();
          
        } catch (err) {
          console.error('❌ Failed to restore server-side user info', err);
          
          // 🔥 UPDATED: Handle different error scenarios
          if (err?.status === 404) {
            console.log('❌ User not found in system');
            this.authService.setUserAuthorized(false);
            // Don't logout, let RoleGuard handle the redirect
            return;
          } else if (err?.status === 403) {
            console.log('❌ User access forbidden');
            this.authService.setUserAuthorized(false);
            return;
          } else {
            // For other errors (network issues, etc.), force logout
            await this.authService.logout();
            return;
          }
        }
      } else if (isLogged && !user?.email) {
        console.warn('⚠️ Logged in but no user email available');
        await this.authService.logout();
      }
      
    } catch (error) {
      console.error('❌ Error in app initialization:', error);
      // On error, ensure clean state
      await this.authService.logout();
    }
  }
}