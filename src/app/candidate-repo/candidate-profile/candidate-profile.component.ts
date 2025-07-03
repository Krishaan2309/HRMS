import { Component} from '@angular/core';
import { OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { Router } from '@angular/router';
import { CandidateRepoService } from 'src/app/candidate-repo.service';
import { Candidate } from 'src/modals/all-candidate-modal';
import { ToastService } from 'src/app/toast.service';


@Component({
  selector: 'app-candidate-profile',
  templateUrl: './candidate-profile.component.html',
  styleUrls: ['./candidate-profile.component.css']
})
export class CandidateProfileComponent implements OnInit {

  candidate: Candidate;
  currentUrl = '';
  selectedStatus:string = ''
  notes:string = ''
  userId: number; 
  reviewedDate:Date;
  reviewedCheck:boolean;
  constructor(private candidateRepo: CandidateRepoService,
              private router: Router,
              private toastService: ToastService) {
                this.userId = this.candidateRepo.getUserInfo()?.userId
                
              }

  ngOnInit() {
    this.candidate = this.candidateRepo.selectedCandidate;
    // console.log("ngonit progile page", this.candidate)
    // this.candidateRepo.getCandidate(this.candidate?.basicInfo?.candidateId).subscribe({
    //     next:(res=>{
    //       this.candidate = res.data  
    //     }),
    //     error:(err=>{
    //       alert("cant get candidate info")
    //     })
    //   })

    this.candidateRepo.tableEdit = '';
    this.selectedStatus = this.candidate?.reviewStatus?.reviewAction ?? '';
    this.notes = this.candidate?.reviewStatus?.reviewNotes ?? '';
    console.log(this.candidate)
  }
    ngOnDestroy(){
    this.candidateRepo.selectedCandidate = null
    // this.candidateRepoService.tableEdit=''
  }
  navigatingBack(){
    this.currentUrl = this.candidateRepo.lastUrl;
    console.log('Received URL in profile:', this.currentUrl);
    this.router.navigate([this.currentUrl]);
  }

  activeTab: string = 'details';
  showSuccessMessage :Boolean = false;

  isVisible : Boolean = false;
  // Open the popup
  statusPopupOpen(): void {
    this.isVisible = true;
    this.selectedStatus = this.candidate.reviewStatus?.reviewAction ?? '';
    this.notes = this.candidate.reviewStatus?.reviewNotes ?? '';
  }

  // Close the popup
  statusPopupClose(): void {
    this.isVisible = false;
    // this.selectedStatus ='';
    // this.notes = '';
  }

  setTab(tab: string) {
    this.activeTab = tab;
  }

  
  
  // statusData: { status: string; notes: string } = {
  //   status: '',
  //   notes: ''
  // };
  
  submitStatus(): void {
  // this.statusData.status = this.selectedStatus;
  // this.statusData.notes = this.notes;
  const payload = {reviewAction: this.selectedStatus, reviewNotes: this.notes, lastUpdatedBy:this.userId }
  // console.log("review status",payload)
  this.candidateRepo.updateReviewStatus(this.candidate?.basicInfo?.candidateId, payload).subscribe({
    next:(res)=>{
      this.toastService.show('Candidate status updated successfully','success','Status Updated')
      this.statusPopupClose()
      this.candidateRepo.getCandidate(this.candidate?.basicInfo?.candidateId).subscribe({
        next:(res=>{
          this.candidate = res.data  
        }),
        error:(err=>{
          this.toastService.show('Cannot able to get Candidate Info','error','Data failed to upload')
        })
      })
    },
    error:(err)=>{
      this.toastService.show('Candidate status failed to update','error','Data failed to upload')
    }
  })

  // console.log('Submitted Status Data:', this.statusData);
  this.selectedStatus ='';
  this.notes = '';
  this.showSuccessMessage = true;
  setTimeout(() => {
    this.showSuccessMessage = false;
  }, 2000);
  }
  
}


  


