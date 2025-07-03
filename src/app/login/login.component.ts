import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CandidateRepoService } from '../candidate-repo.service';
import { firstValueFrom } from 'rxjs';
import { filter, take, timeout } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoggedIn = false;
  user: any = null;
  
  constructor(
    private authService: AuthService,
    private router: Router,
    private candidateRepoService: CandidateRepoService
  ) {}

  async ngOnInit() {
    try {
      console.log('🔄 LoginComponent ngOnInit started');
      
      // First check current auth state without waiting
      const currentAuthState = await Promise.race([
        this.authService.waitForCompleteAuth(),
        new Promise<boolean>(resolve => setTimeout(() => resolve(false), 1000)) // 1 second timeout
      ]);
      
      console.log('🔍 Current auth state:', currentAuthState);
      
      if (currentAuthState) {
        console.log('✅ Already authenticated, navigating to dashboard');
        await this.router.navigate(['candidate-repo/dashboard']);
        return;
      }

      // Check if we have a token but missing user info (recovery scenario)
      const token = await this.authService.getToken();
      const currentUser = this.authService.getCurrentUser();
      
      console.log('🔍 Token exists:', !!token, 'Current user:', !!currentUser);
      
      if (token && !currentUser) {
        console.log('🔄 Recovering user info with existing token');
        try {
          const user = await firstValueFrom(
            this.authService.getUser().pipe(
              filter(u => u !== null),
              take(1)
            )
          );
          
          if (user?.email) {
            // 🔥 UPDATED: Better error handling for user info recovery
            try {
              await firstValueFrom(this.candidateRepoService.fetchAndStoreUserInfo(user.email));
              
              // Check if user is authorized
              const userInfo = this.candidateRepoService.getUserInfo();
              if (userInfo && this.checkUserAuthorization(userInfo)) {
                this.authService.completeLogin();
                this.authService.setUserAuthorized(true);
                console.log('✅ User info recovered and authorized, navigating to dashboard');
                await this.router.navigate(['candidate-repo/dashboard']);
                return;
              } else {
                console.log('❌ User recovered but not authorized');
                this.authService.setUserAuthorized(false);
                await this.router.navigate(['/unauthorized']);
                return;
              }
            } catch (fetchError) {
              console.warn('⚠️ Could not recover user info:', fetchError);
              
              // Handle different error scenarios
              if (fetchError?.status === 404) {
                console.log('❌ User not found in system');
                await this.router.navigate(['/unauthorized']);
                return;
              }
              // For other errors, continue to normal login flow
            }
          }
        } catch (recoveryError) {
          console.warn('⚠️ Could not recover user info:', recoveryError);
          // Continue to normal login flow
        }
      }

      // Subscribe to login status changes
      this.authService.isLoggedIn().subscribe(status => {
        this.isLoggedIn = status;
        console.log('🔍 Login status changed:', status);
      });

      console.log('✅ LoginComponent initialization completed');

    } catch (error) {
      console.error('❌ Error in login component init:', error);
    }
  }

  // 🔥 NEW: Helper method to check user authorization
  private checkUserAuthorization(userInfo: any): boolean {
    const allowedRoleIds = [4, 5];
    const roles = userInfo?.roles ?? [];
    return roles.some((role: any) => allowedRoleIds.includes(role.roleId));
  }

  async login() {
    try {
      console.log('🔄 Starting login process...');
      
      // Reset any previous state
      this.authService.loginComplete$.next(false);
      this.authService.setUserAuthorized(null); // Reset authorization status
      
      // 1. Perform MSAL login
      await this.authService.login();
      console.log('✅ MSAL login completed');
      
      // 2. Wait for user data to be available with timeout
      const user = await firstValueFrom(
        this.authService.getUser().pipe(
          filter(u => u !== null && u.email !== null),
          take(1),
          timeout(10000) // 10 second timeout
        )
      );
      
      console.log('✅ User data retrieved:', user.email);
      
      // 3. Fetch and store additional user info
      console.log('🔄 Fetching server-side user info...');
      
      try {
        await firstValueFrom(this.candidateRepoService.fetchAndStoreUserInfo(user.email));
        console.log('✅ User info fetched and stored');
        
        // 4. Check if user has required roles
        const userInfo = this.candidateRepoService.getUserInfo();
        if (!userInfo || !this.checkUserAuthorization(userInfo)) {
          console.log('❌ User does not have required roles');
          this.authService.setUserAuthorized(false);
          
          // Show user-friendly message
          alert('Access Denied: You do not have the required permissions to access this application. Please contact your administrator.');
          
          // Redirect to unauthorized page
          await this.router.navigate(['/unauthorized']);
          return;
        }
        
        console.log('✅ User authorized with required roles');
        this.authService.setUserAuthorized(true);
        
      } catch (fetchError) {
        console.error('❌ Failed to fetch user info:', fetchError);
        
        // Handle different error scenarios
        if (fetchError?.status === 404) {
          console.log('❌ User not found in system');
          alert('Access Denied: Your account was not found in the system. Please contact your administrator.');
          await this.router.navigate(['/unauthorized']);
          return;
        } else if (fetchError?.status === 403) {
          console.log('❌ User access forbidden');
          alert('Access Denied: You do not have permission to access this application.');
          await this.router.navigate(['/unauthorized']);
          return;
        } else {
          // For other errors, show generic error
          throw fetchError;
        }
      }
      
      // 5. Complete the login process
      this.authService.completeLogin();
      console.log('✅ Login process completed');
      
      // 6. Small delay to ensure all observables are updated
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 7. Navigate to dashboard
      console.log('🔄 Navigating to dashboard...');
      await this.router.navigate(['candidate-repo/dashboard']);
      console.log('✅ Navigation completed');
      
    } catch (err) {
      console.error("❌ Login failed:", err);
      
      // Clean up on error
      this.authService.loginComplete$.next(false);
      this.authService.setUserAuthorized(null);
      
      // Force logout to clean state
      await this.authService.logout();
      
      // Show error to user
      if (err?.name === 'TimeoutError') {
        alert('Login timeout. Please try again.');
      } else {
        alert('Login failed. Please try again.');
      }
    }
  }
}