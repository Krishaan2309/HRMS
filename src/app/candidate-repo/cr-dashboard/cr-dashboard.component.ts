import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';
import { CandidateRepoService } from 'src/app/candidate-repo.service';
import { AuthUser } from 'src/modals/authUser';


@Component({
  selector: 'app-cr-dashboard',
  templateUrl: './cr-dashboard.component.html',
  styleUrls: ['./cr-dashboard.component.css']
})
export class CrDashboardComponent {
  isLoggedIn:boolean = false;
  user:AuthUser | null = null;
  manuallyAddedCount: number;
  importedCount: number;
  consultancyCount: number;
  touchedCount: number;
  untouchedCount: number;
  touchedPercentage: number;
  interestedCount: number;
  notInterestedCount: number;
  cnrCount: number;
  totalRecords :number;

  constructor(
    private router: Router,
    private authService: AuthService,
    private candidateRepoService: CandidateRepoService
  ){}



   ngOnInit(): void {
    this.authService.isLoggedIn().subscribe(status => this.isLoggedIn = status);
    this.authService.getUser().subscribe(user => this.user = user);
    this.candidateRepoService.getDashboardSummary().subscribe({
      next: (res)=>{
        this.manuallyAddedCount = res?.data?.profileSourceManualCount
        this.importedCount = res?.data?.profileSourceImportedCount
        this.consultancyCount = res?.data?.profileSourceConsultancyCount
        this.touchedCount = res?.data?.touchedCount
        this.untouchedCount = res?.data?.unTouchedCount
        this.touchedPercentage = Math.round((res?.data?.touchedCount / (res?.data?.touchedCount + res?.data?.unTouchedCount)) * 100 * 100) / 100;
        this.interestedCount = res?.data?.reviewInterestedCount
        this.notInterestedCount = res?.data?.reviewNotInterestedCount
        this.cnrCount = res?.data?.reviewCNRCount
        this.totalRecords = this.manuallyAddedCount + this.consultancyCount + this.importedCount;
      },
      error: (err)=>{
        alert("Error when getting dashboard sumary data")
      }
    })

    // console.log("User info", this.candidateRepoService.getUserInfo())
  }

  navigateToAddCandidate() {
  this.router.navigate(['candidate-repo/add-candidate']);
}

navigateToImportCandidate() {
  this.router.navigate(['candidate-repo/import-candidates']);
}

navigateToConsultancy(){
  this.router.navigate(['consultancy-portal-not-found-page']);
}

}
