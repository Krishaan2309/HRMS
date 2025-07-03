import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable, firstValueFrom } from 'rxjs';
import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { AccountInfo, AuthenticationResult, EventType } from '@azure/msal-browser';
import { AuthUser } from 'src/modals/authUser';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public loggedIn = new BehaviorSubject<boolean>(false);
  private userInfo = new BehaviorSubject<AuthUser | null>(null);
  public loginComplete$ = new BehaviorSubject<boolean>(false);
  
  // Add this to track when user info is ready
  private userInfoReady$ = new BehaviorSubject<boolean>(false);
  
  // 🔥 NEW: Track user authorization status
  private userAuthorized$ = new BehaviorSubject<boolean | null>(null); // null = unknown, true = authorized, false = unauthorized

  constructor(
    private msalService: MsalService,
    private msalBroadcastService: MsalBroadcastService
  ) {
    this.setupAuthEvents();
  }

  // ✅ Called from APP_INITIALIZER after MSAL is initialized
  async init(): Promise<void> {
    await this.restoreAuthState();

    const account = this.msalService.instance.getActiveAccount();

    if (!account && this.msalService.instance.getAllAccounts().length > 0) {
      this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
    }

    const restoredAccount = this.msalService.instance.getActiveAccount();
    if (restoredAccount) {
      const token = await this.getToken();
      this.setUserInfo(restoredAccount, token || '');
      this.loggedIn.next(true);
      this.userInfoReady$.next(true);
    }
  }

  private setupAuthEvents() {
    this.msalBroadcastService.msalSubject$
      .pipe(filter((msg) => msg.eventType === EventType.LOGIN_SUCCESS))
      .subscribe(async (result) => {
        console.log('🔄 MSAL LOGIN_SUCCESS event received');
        const authResult = result.payload as AuthenticationResult;
        this.msalService.instance.setActiveAccount(authResult.account);
        const token = authResult.accessToken;
        this.setUserInfo(authResult.account, token);
        this.loggedIn.next(true);
        localStorage.setItem('isLoggedIn', 'true');
        
        console.log('✅ MSAL authentication completed, user info set');
        
        // 🔥 FIX: Trigger complete login flow when MSAL popup login happens
        // This handles the case where user logs in via popup after direct URL access
        await this.handlePopupLoginComplete(authResult.account);
      });
  }

  // 🔥 UPDATED: Handle complete login flow for popup logins with better error handling
  private async handlePopupLoginComplete(account: AccountInfo) {
    try {
      console.log('🔄 Handling popup login completion...');
      
      // Import CandidateRepoService dynamically to avoid circular dependency
      const { CandidateRepoService } = await import('./candidate-repo.service');
      const candidateRepoService = this.injector?.get(CandidateRepoService);
      
      if (candidateRepoService && account.username) {
        console.log('🔄 Fetching server-side user info after popup login...');
        
        try {
          await firstValueFrom(candidateRepoService.fetchAndStoreUserInfo(account.username));
          console.log('✅ Server-side user info fetched after popup login');
          
          // Check if user has proper roles
          const userInfo = candidateRepoService.getUserInfo();
          if (userInfo && this.checkUserAuthorization(userInfo)) {
            this.userAuthorized$.next(true);
            this.completeLogin();
            console.log('✅ User authorized and login completed');
          } else {
            console.log('❌ User not authorized - insufficient roles');
            this.userAuthorized$.next(false);
            // Don't complete login for unauthorized users
            this.userInfoReady$.next(true); // But mark user info as ready so RoleGuard can handle it
          }
          
        } catch (fetchError) {
          console.error('❌ Failed to fetch user info:', fetchError);
          
          // Check if it's a 404 (user not found) vs other errors
          if (fetchError?.status === 404) {
            console.log('❌ User not found in system');
            this.userAuthorized$.next(false);
            this.userInfoReady$.next(true); // Mark as ready so RoleGuard can redirect
          } else {
            // For other errors, treat as system error and logout
            await this.logout();
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in popup login completion:', error);
      // If user info fetch fails, clean up the auth state
      await this.logout();
    }
  }

  // 🔥 NEW: Check if user has required authorization
  private checkUserAuthorization(userInfo: any): boolean {
    const allowedRoleIds = [4, 5];
    const roles = userInfo?.roles ?? [];
    return roles.some((role: any) => allowedRoleIds.includes(role.roleId));
  }

  // 🔥 NEW: Add injector for dynamic service injection
  private injector?: any;
  
  // 🔥 NEW: Method to set injector (call this from app.component or app.module)  
  setInjector(injector: any) {
    this.injector = injector;
  }

  async restoreAuthState(): Promise<void> {
    const savedLogin = localStorage.getItem('isLoggedIn');
    const accounts = this.msalService.instance.getAllAccounts();

    if (savedLogin === 'true' && accounts.length > 0) {
      this.msalService.instance.setActiveAccount(accounts[0]);
      const account = this.msalService.instance.getActiveAccount();

      if (account) {
        const token = await this.getToken();
        this.setUserInfo(account, token || '');
        this.loggedIn.next(true);
        this.userInfoReady$.next(true);
      }
    }
  }

  login(): Promise<void> {
    return this.msalService.loginPopup().toPromise().then(async result => {
      this.msalService.instance.setActiveAccount(result.account);
      const token = await this.getToken();
      this.setUserInfo(result.account, token || '');
      this.loggedIn.next(true);
      localStorage.setItem('isLoggedIn', 'true');
    });
  }

  async unauth(){
    this.loggedIn.next(false);
    this.loginComplete$.next(false);
  }
  async logout() {
    console.log("Live tested by krishaan")
    this.loggedIn.next(false);
    this.userInfo.next(null);
    this.userInfoReady$.next(false);
    this.loginComplete$.next(false);
    this.userAuthorized$.next(null); // 🔥 Reset authorization status
    localStorage.removeItem('isLoggedIn');
    
    // Get all accounts before logout
    const accounts = this.msalService.instance.getAllAccounts();
    
    // Perform logout redirect
    await this.msalService.logoutRedirect({
      postLogoutRedirectUri: environment.msal.postLogoutRedirectUri
    }).toPromise();

    // Clear the local cache after logout
    setTimeout(() => {
      if (accounts.length > 0) {
        this.msalService.instance.clearCache();
      }
    }, 1000);
  }

  // ✅ Updated method to complete the login process after user info is fetched
  completeLogin() {
    this.userInfoReady$.next(true);
    this.loginComplete$.next(true);
  }

  // 🔥 NEW: Method to mark user as authorized
  setUserAuthorized(authorized: boolean) {
    this.userAuthorized$.next(authorized);
  }

  // 🔥 NEW: Observable for user authorization status
  isUserAuthorized(): Observable<boolean | null> {
    return this.userAuthorized$.asObservable();
  }

  postLogin() {
    this.loggedIn.next(true);
    localStorage.setItem('isLoggedIn', 'true');
  }

  private setUserInfo(account: AccountInfo | null, accessToken: string = '') {
    if (!account) return;
    const email = account.username;
    const username = account.name || account.username;
    // const userId = account
    this.userInfo.next({ username, email, accessToken });
  }

  getToken(): Promise<string | null> {
    const account = this.msalService.instance.getActiveAccount();
    if (!account) return Promise.resolve(null);

    return this.msalService.acquireTokenSilent({
      scopes: ['api://061fc813-e85f-484d-bc41-ef6e187e63df/access_as_user'],
      account: account,
    }).toPromise().then(result => result.accessToken);
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getUser(): Observable<AuthUser> {
    return this.userInfo.asObservable();
  }

  getCurrentUser(): AuthUser | null {
    return this.userInfo.getValue();
  }

  // ✅ New method to check if user info is ready
  isUserInfoReady(): Observable<boolean> {
    return this.userInfoReady$.asObservable();
  }

  // ✅ Wait for complete authentication (MSAL + user info)
  async waitForCompleteAuth(): Promise<boolean> {
    try {
      // Wait for both login state and user info to be ready
      const [isLoggedIn, isUserReady] = await Promise.all([
        firstValueFrom(this.isLoggedIn().pipe(filter(status => status === true))),
        firstValueFrom(this.isUserInfoReady().pipe(filter(ready => ready === true)))
      ]);
      
      return isLoggedIn && isUserReady;
    } catch (error) {
      console.error('Error waiting for complete auth:', error);
      return false;
    }
  }
}