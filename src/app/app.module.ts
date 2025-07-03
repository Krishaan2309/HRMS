import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
} from '@azure/msal-browser';
import {
  MsalModule,
  MsalService,
  MSAL_INSTANCE,
  MsalRedirectComponent,
  MsalGuardConfiguration,
  MSAL_GUARD_CONFIG,
  MsalInterceptorConfiguration,
  MSAL_INTERCEPTOR_CONFIG,
} from '@azure/msal-angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SidenavbarComponent } from './sidenavbar/sidenavbar.component';
import { CrDashboardComponent } from './candidate-repo/cr-dashboard/cr-dashboard.component';
import { CrAllcandidatesComponent } from './candidate-repo/cr-allcandidates/cr-allcandidates.component';
import { CrAddCandidateComponent } from './candidate-repo/cr-add-candidate/cr-add-candidate.component';
import { CrImportCandidatesComponent } from './candidate-repo/cr-import-candidates/cr-import-candidates.component';
import { CandidateRepoComponent } from './candidate-repo/candidate-repo.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoaderComponent } from './loader/loader.component';
import { LoaderInterceptor } from './loader.interceptor';
import { ReactiveFormsModule } from '@angular/forms';
import { CandidateTableComponent } from './candidate-repo/cr-allcandidates/candidate-table/candidate-table.component';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MenuModule } from 'primeng/menu';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { CandidateProfileComponent } from './candidate-repo/candidate-profile/candidate-profile.component';
import { FormsModule } from '@angular/forms';
import { TopheaderBarComponent } from './topheader-bar/topheader-bar.component';
import { CalendarModule } from 'primeng/calendar';
import { AuthService } from './auth.service';
import { environment } from 'src/environments/environment';
import { AuthInterceptor } from './auth.interceptor';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { RoleGuard } from './role.guard';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';
import { CrImportLogsComponent } from './candidate-repo/cr-import-logs/cr-import-logs.component';
import { ToasterComponent } from './toaster/toaster.component';

export const protectedResources = {
  api: {
    endpoint: environment.apiUrl,
    scopes: ['api://061fc813-e85f-484d-bc41-ef6e187e63df/access_as_user']
  }
};

export function MSALInstanceFactory(): IPublicClientApplication {
  return new PublicClientApplication({
    auth: {
      clientId: environment.msal.clientId,
      authority: environment.msal.authority,
      redirectUri: environment.msal.redirectUri,
      postLogoutRedirectUri: environment.msal.postLogoutRedirectUri,
    },
    cache: {
      cacheLocation: 'localStorage',
      storeAuthStateInCookie: false,
    },
  });
}

// ✅ Combined MSAL + AuthService init
export function appInitFactory(authService: AuthService, msalInstance: IPublicClientApplication) {
  return async () => {
    await msalInstance.initialize();     // Ensure MSAL is initialized first
    await authService.init();           // Then do your custom auth setup
  };
}

export function MSALGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Popup,
    authRequest: {
      scopes: ['api://061fc813-e85f-484d-bc41-ef6e187e63df/access_as_user'],
    },
  };
}

export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string>>();
  protectedResourceMap.set(
    protectedResources.api.endpoint,
    protectedResources.api.scopes
  );

  return {
    interactionType: InteractionType.Popup,
    protectedResourceMap,
  };
}

@NgModule({
  declarations: [
    AppComponent,
    SidenavbarComponent,
    CrDashboardComponent,
    CrAllcandidatesComponent,
    CrAddCandidateComponent,
    CrImportCandidatesComponent,
    CandidateRepoComponent,
    LoginComponent,
    LoaderComponent,
    CandidateTableComponent,
    CandidateProfileComponent,
    TopheaderBarComponent,
    UnauthorizedComponent,
    NotFoundPageComponent,
    CrImportLogsComponent,
    ToasterComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    TableModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    BrowserAnimationsModule,
    MenuModule,
    OverlayPanelModule,
    FormsModule,
    CalendarModule,
    MsalModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: LoaderInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: MSAL_INSTANCE,
      useFactory: MSALInstanceFactory,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useFactory: MSALGuardConfigFactory,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useFactory: MSALInterceptorConfigFactory,
    },
    // ✅ Final working APP_INITIALIZER
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [AuthService, MSAL_INSTANCE],
      multi: true,
    },
    MsalService,
    RoleGuard
  ],
  bootstrap: [AppComponent, MsalRedirectComponent]
})
export class AppModule { }
