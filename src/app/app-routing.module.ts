import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CandidateRepoComponent } from './candidate-repo/candidate-repo.component';
import { CrDashboardComponent } from './candidate-repo/cr-dashboard/cr-dashboard.component';
import { CrAddCandidateComponent } from './candidate-repo/cr-add-candidate/cr-add-candidate.component';
import { CrAllcandidatesComponent } from './candidate-repo/cr-allcandidates/cr-allcandidates.component';
import { CrImportCandidatesComponent } from './candidate-repo/cr-import-candidates/cr-import-candidates.component';
import { LoginComponent } from './login/login.component';
import { CandidateProfileComponent } from './candidate-repo/candidate-profile/candidate-profile.component';
import { MsalGuard } from '@azure/msal-angular';
import { RoleGuard } from './role.guard';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { NotFoundPageComponent } from './not-found-page/not-found-page.component';

const routes: Routes = [
  // Redirect empty path to login
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home-not-found-page', component: NotFoundPageComponent },
  { path: 'overview-not-found-page', component: NotFoundPageComponent },
  { path: 'my-requests-not-found-page', component: NotFoundPageComponent },
  { path: 'jobs-not-found-page', component: NotFoundPageComponent },
  { path: 'employee-not-found-page', component: NotFoundPageComponent },
  { path: 'structure-not-found-page', component: NotFoundPageComponent },
  { path: 'reports-not-found-page', component: NotFoundPageComponent },
  { path: 'settings-not-found-page', component: NotFoundPageComponent },
  { path: 'consultancy-portal-not-found-page', component: NotFoundPageComponent },
  // Login route (no guard)
  { path: 'login', component: LoginComponent },

  // Protected candidate-repo parent route with guards
  {
    path: 'candidate-repo',
    component: CandidateRepoComponent,
    canActivate: [MsalGuard, RoleGuard],  // guards run here
    children: [
      // Child routes inherit guards from parent
      { path: 'dashboard', component: CrDashboardComponent },
      { path: 'candidates', component: CrAllcandidatesComponent },
      { path: 'add-candidate', component: CrAddCandidateComponent },
      { path: 'import-candidates', component: CrImportCandidatesComponent },
      { path: 'profile', component: CandidateProfileComponent },
      { path: 'consultancy-portal', component: NotFoundPageComponent },

      // Optionally, redirect empty child path to dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ]
  },

  // Unauthorized access page (no guard)
  { path: 'unauthorized', component: UnauthorizedComponent },

  // Catch-all wildcard route - redirects unknown paths to login or candidate-repo/dashboard
  // { path: '**', redirectTo: 'unauthorized' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
