import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

import { Router } from '@angular/router';
import { CandidateRepoService } from 'src/app/candidate-repo.service';
import { AddCandidateDetails, BasicInfo, CompensationLocation, ProfessionalDetails, Skills} from 'src/modals/add-candidate-details-modal';
import { ToastService } from 'src/app/toast.service';
import { Activity, Candidate, Position } from 'src/modals/all-candidate-modal';
import { BasicInfoEdit } from 'src/modals/edit-candidate-details-modal';
import { NoticePeriod } from 'src/modals/notice-period.model';
@Component({
  selector: 'app-cr-add-candidate',
  templateUrl: './cr-add-candidate.component.html',
  styleUrls: ['./cr-add-candidate.component.css']
})
export class CrAddCandidateComponent {

  selectedTab : string = 'candidate-info';
  selectedCandidate: Candidate
  basicInfo: BasicInfo
  basicInfoEdit: BasicInfoEdit
  professionalInfo: ProfessionalDetails
  skillsInfo: Skills
  compensationInfo: CompensationLocation
  today:Date = new Date()
  // positionInfo: Position
  // reviewSatusInfo: ReviewStatus
  submitAction: 'add' | 'view' = 'add';
  addCandidateFormBasicDetails: FormGroup;
  addCandidateFormProfDetails: FormGroup;
  addCandidateFormSkills: FormGroup;
  addCandidateFormCompensationLocation: FormGroup;
  profileSource = ["Naukri", "Article", "LinkedIn", "Refferal", "Other"]
  basicDetailsFormSubmitted:boolean = false;
  profDetailsFormSubmitted:boolean = false;
  skillsDetailsFormSubmitted:boolean = false;
  compAndLocDetailsFormSubmitted:boolean = false;
  isEdit = this.candidateRepoService.tableEdit
  positions: Position[]
  noticePeriodOptions: NoticePeriod[]
  isAdmin:boolean = false
  isEditBool:boolean = false


experienceYears: number[] = Array.from({ length: 31 }, (_, i) => i); // 0 to 30
experienceMonths: number[] = Array.from({ length: 12 }, (_, i) => i); // 0 to 11



preferredLocations = [
  "Chennai",
  "Philippines",
  "USA"
]



  constructor(private fb: FormBuilder,
    private candidateRepoService: CandidateRepoService,
    private router: Router,
    private toastService: ToastService
  ){
    console.log("constructor of ad candidate")
    this.addCandidateFormBasicDetails = this.fb.group({
      candidateName: ['', [Validators.required,Validators.minLength(3)]],
      candidateEmail: ['', [Validators.required, this.commaSeparatedEmailsValidator()]],
      candidateMobile: ['', [Validators.required, this.commaSeparatedMobilesValidator()]],
      profileReceivedDate: ['', Validators.required],
      profileSource: ['', Validators.required],
      subSource:[''],
      employmentType:['', Validators.required]
    })




    this.addCandidateFormProfDetails = this.fb.group({
      currentCompany: ['', [Validators.required,Validators.minLength(2)]],
      currentDesignation: ['', [Validators.required, Validators.minLength(2)]],
      positionId: ['', Validators.required],
      experienceInYears: ['', Validators.required],
      experienceInMonths: ['', Validators.required]
    })




    this.addCandidateFormSkills = this.fb.group({
      softwareWorked: ['', [Validators.required,Validators.minLength(2)]],
      candidateSkills: ['', [Validators.required, Validators.minLength(2)]],
      
    })


    this.addCandidateFormCompensationLocation = this.fb.group({
      currentCtc: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
      expectedCtc: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
      currentGross: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
      expectedGross: ['', [Validators.required,  Validators.pattern('^[0-9]+$')]],
      noticePeriodId: ['', Validators.required],
      currentLocation: ['', Validators.required],
      preferredLocation: ['', Validators.required],
      preferredArea: ['', Validators.required]
    })

  }

  ngOnInit(){
    const userInfo = this.candidateRepoService.getUserInfo()
    
    this.isAdmin = userInfo.roles?.some(role => role.roleId === 4) || false;
    this.isEditBool = this.candidateRepoService.tableEdit === 'Edit';


    console.log("userInfo", this.isAdmin)
    
    this.candidateRepoService.getPositions().subscribe({next: (res)=>{
      this.positions = res.data 
      console.log("Positions", this.positions)
    },
    error: (err)=>{
      console.log("Failed to fetch positions", err)
    }})


    this.candidateRepoService.getNoticePeriods().subscribe({next: (res)=>{
      this.noticePeriodOptions = res.data 
      console.log("NoticePeriods", this.noticePeriodOptions)
    },
    error: (err)=>{
      console.log("Failed to fetch NoticePeriods", err)
    }})



  console.log("add candidate", this.candidateRepoService.selectedCandidate)
  
  // this.noticePeriodOptions.push(this.candidateRepoService?.selectedCandidate?.compensationLocation?.noticePeriodDays)
  if(this.candidateRepoService.selectedCandidate && this.candidateRepoService.tableEdit == 'Edit'){

    this.selectedCandidate = this.candidateRepoService.selectedCandidate;
        this.basicDetailsFormSubmitted = true
        this.profDetailsFormSubmitted = true
        this.skillsDetailsFormSubmitted = true
        this.compAndLocDetailsFormSubmitted = true

    this.addCandidateFormBasicDetails.patchValue({
      candidateName: this.selectedCandidate.basicInfo?.candidateName ?? '',
      candidateEmail: this.selectedCandidate.basicInfo?.candidateEmail ?? '',
      candidateMobile: this.selectedCandidate.basicInfo?.candidateMobile ?? '',
      profileReceivedDate: this.selectedCandidate.basicInfo?.profileReceivedDate 
          ? new Date(this.selectedCandidate.basicInfo.profileReceivedDate) 
          : null,
      profileSource: this.selectedCandidate.basicInfo?.profileSource ?? '',
      subSource: this.selectedCandidate.basicInfo?.subSource ?? '',
      employmentType: this.selectedCandidate.basicInfo?.employmentType ?? ''
    });

   this.addCandidateFormProfDetails.patchValue({
      currentCompany: this.selectedCandidate?.professionalDetails?.currentCompany ?? '',
      currentDesignation: this.selectedCandidate?.professionalDetails?.currentDesignation ?? '',
      positionId: this.selectedCandidate?.professionalDetails?.positionId ?? '',
      experienceInYears: this.selectedCandidate?.professionalDetails?.experienceInYears ??'',
      experienceInMonths: this.selectedCandidate?.professionalDetails?.experienceInMonths ??''
   })

   this.addCandidateFormSkills.patchValue({
    softwareWorked: this.selectedCandidate?.skills?.softwareWorked ?? 'NA',
    candidateSkills: this.selectedCandidate?.skills?.candidateSkills ?? 'NA'
   })


   this.addCandidateFormCompensationLocation.patchValue({
      currentCtc: this.selectedCandidate?.compensationLocation?.currentCtc ?? '0', 
      expectedCtc: this.selectedCandidate?.compensationLocation?.expectedCtc ?? '0',
      currentGross: this.selectedCandidate?.compensationLocation?.currentGross ?? '0', 
      expectedGross: this.selectedCandidate?.compensationLocation?.expectedGross ?? '0',
      noticePeriodId: this.selectedCandidate?.compensationLocation?.noticePeriodId ?? '',
      currentLocation: this.selectedCandidate?.compensationLocation?.currentLocation ?? '',
      preferredLocation: this.selectedCandidate?.compensationLocation?.preferredLocation ?? 'Chennai',
      preferredArea: this.selectedCandidate?.compensationLocation?.preferredArea ?? 'NA'
   })

  }
}

  ngOnDestroy(){
    // this.candidateRepoService.selectedCandidate = null
    this.candidateRepoService.tableEdit=''
  }

  onAddCandidateFormSubmit(formDetail:string){
    if(this.addCandidateFormBasicDetails.valid && formDetail=="basic-info"){
      this.basicDetailsFormSubmitted = true
      this.selectedTab = 'professional-details';
      // console.log("Basic details of candidate form",this.addCandidateFormBasicDetails.value)
      this.basicInfo = this.addCandidateFormBasicDetails.value
      if(this.candidateRepoService.tableEdit!="Edit"){
      this.basicInfo.createdBy=this.candidateRepoService.getUserInfo()?.userId
      }
      else if(this.candidateRepoService.tableEdit=="Edit"){
        this.basicInfoEdit = this.addCandidateFormBasicDetails.value
        this.basicInfoEdit.lastUpdatedBy=this.candidateRepoService.getUserInfo()?.userId
      }
      console.log(this.basicInfo)
    }
    else{
      console.log("Form in invalid enter all neccessary field")
    }

    if(this.addCandidateFormProfDetails.valid && formDetail=="prof-info"){
      this.profDetailsFormSubmitted = true
      this.selectedTab = 'skills-speciality';
      // console.log("Prof details of candidate form",this.addCandidateFormProfDetails.value)
      this.professionalInfo = this.addCandidateFormProfDetails.value
      // if(this.candidateRepoService.tableEdit!="Edit"){
      // }

      console.log(this.professionalInfo)
    }
    else{
      console.log("Form in invalid enter all neccessary field")
    }

    if(this.addCandidateFormSkills.valid && formDetail=="skills-info"){
      this.skillsDetailsFormSubmitted = true
      this.selectedTab = 'compensation-location';
      // console.log("Skills details of candidate form",this.addCandidateFormSkills.value)
      this.skillsInfo = this.addCandidateFormSkills.value
      if(this.candidateRepoService.tableEdit!="Edit"){
      }
      console.log(this.skillsInfo)
    }
    else{
      console.log("Form in invalid enter all neccessary field")
    }




    // if(this.addCandidateFormBasicDetails.valid && this.addCandidateFormProfDetails.valid && this.addCandidateFormSkills.valid && this.addCandidateFormCompensationLocation.valid){
    //   this.finalFormSubmit(this.submitAction)
    // }
  }

  finalFormSubmit(action: 'add' | 'view'){
    this.onAddCandidateFormSubmit('basic-info')
    this.onAddCandidateFormSubmit('prof-info')
    this.onAddCandidateFormSubmit('skills-info')
    if(this.addCandidateFormCompensationLocation.valid){
      this.compAndLocDetailsFormSubmitted = true
      // console.log("Comp and Loc details of candidate form",this.addCandidateFormCompensationLocation.value)
      this.compensationInfo = this.addCandidateFormCompensationLocation.value
      if(this.candidateRepoService.tableEdit!="Edit"){
      }
      console.log(this.compensationInfo)
    }
    else{
      console.log("Form in invalid enter all neccessary field")
    }
    if(this.addCandidateFormBasicDetails.valid && this.addCandidateFormProfDetails.valid && this.addCandidateFormSkills.valid && this.addCandidateFormCompensationLocation.valid){
      // const positionId = this.professionalInfo?.positionId;
      // const selectedPosition = this.positions.find(p => p.positionId == positionId);
      // console.log("selectedPosition",selectedPosition)
      // const positions :Position = { positionId: positionId, positionName:selectedPosition?.positionName}
      // const reviewStatus:ReviewStatus = {reviewStatusId: 0, candidateId: 0, reviewAction: "", reviewNotes: "", lastUpdatedUserId: 0, lastUpdatedUserName:""}
      // console.log("before activity", this.candidateRepoService?.selectedCandidate)
      const userInfo = this.candidateRepoService.getUserInfo()
      // const activity:Activity = {profileAddedDateTime: this.candidateRepoService.selectedCandidate?.activity?.profileAddedDateTime || new Date().toISOString(), profileAddedBy: this.candidateRepoService.selectedCandidate?.activity?.profileAddedBy || userInfo.userName , profileReviewedDateTime:this.candidateRepoService.selectedCandidate?.activity?.profileReviewedDateTime || '0001-01-01T00:00:00', profileReviewedBy: this.candidateRepoService.selectedCandidate?.activity?.profileReviewedBy || 'NA'}
      // const activity:Activity = {profileAddedDateTime: new Date().toISOString(), profileAddedBy: '' , profileReviewedDateTime:'', profileReviewedBy: ''}
      // this.basicInfo.createdDateTime = this.basicInfo.createdDateTime || new Date().toISOString()
      // this.basicInfo.lastUpdatedDateTime = this.basicInfo.lastUpdatedDateTime || new Date().toISOString()

      // this.professionalInfo.createdDateTime = this.professionalInfo.createdDateTime || new Date().toISOString()
      // this.professionalInfo.lastUpdatedDateTime = this.professionalInfo.lastUpdatedDateTime || new Date().toISOString()

      // this.skillsInfo.createdDateTime = this.skillsInfo.createdDateTime || new Date().toISOString()
      // this.skillsInfo.lastUpdatedDateTime = this.skillsInfo.lastUpdatedDateTime || new Date().toISOString()

      // this.compensationInfo.createdDateTime = this.compensationInfo.createdDateTime || new Date().toISOString()
      // this.compensationInfo.lastUpdatedDateTime = this.compensationInfo.lastUpdatedDateTime || new Date().toISOString()

      



      // this.professionalInfo.positionId = + this.professionalInfo.positionId
      // this.professionalInfo.positionId = + this.professionalInfo.positionId

      this.compensationInfo.expectedCtc = +this.compensationInfo.expectedCtc
      this.compensationInfo.currentCtc = +this.compensationInfo.currentCtc
      const candidateData: AddCandidateDetails = {basicInfo: this.basicInfo, professionalDetails: this.professionalInfo, skills: this.skillsInfo, compensationLocation: this.compensationInfo}
      if(this.candidateRepoService.tableEdit!="Edit"){
              this.candidateRepoService.addCandidate(candidateData).subscribe({
        next: (res) => {
        console.log('✅ Candidate added successfully:', res.data);
        // alert("Candidate added succesfully")
        this.toastService.show('Entered candidate details added successfully','success','Details Saved Successfully')
        this.addCandidateFormBasicDetails.reset()
        this.addCandidateFormProfDetails.reset()
        this.addCandidateFormSkills.reset()
        this.addCandidateFormCompensationLocation.reset()
        this.basicDetailsFormSubmitted = false
        this.profDetailsFormSubmitted = false
        this.skillsDetailsFormSubmitted = false
        this.compAndLocDetailsFormSubmitted = false
        if(action === 'view'){
        
        this.candidateRepoService.selectedCandidate = res.data
        this.router.navigate(['candidate-repo/profile'])
        }
        if(action==='add'){
          this.selectedTab = 'candidate-info'
          this.basicDetailsFormSubmitted = false
          this.profDetailsFormSubmitted = false
          this.skillsDetailsFormSubmitted = false
          this.compAndLocDetailsFormSubmitted = false
        }
        
        // Optionally show success message or redirect
      },
      error: (err) => {
        console.error('❌ Failed to add candidate:', err);
        this.toastService.show('Entered candidate details failed to upload','error','Data failed to upload')
        // Optionally show error message
      }
    });
    }
    else if(this.candidateRepoService.tableEdit=='Edit'){
      const originalData = this.selectedCandidate
      const candidateId = this.selectedCandidate?.basicInfo?.candidateId
      const updatedCandidate = this.updateObject(originalData, candidateData);
      // const transformedData = this.transformCandidateData(candidateData)
      console.log("EDIT candidate id", candidateId)
      console.log(" data", candidateData)

      this.candidateRepoService.editCandidate(candidateId, updatedCandidate).subscribe({
        next: (res) => {
        console.log('✅ Candidate updated successfully:', res);
        this.toastService.show('Entered candidate details updated successfully','success','Details Updated Successfully')
        this.addCandidateFormBasicDetails.reset()
        this.addCandidateFormProfDetails.reset()
        this.addCandidateFormSkills.reset()
        this.addCandidateFormCompensationLocation.reset()
        this.basicDetailsFormSubmitted = false
        this.profDetailsFormSubmitted = false
        this.skillsDetailsFormSubmitted = false
        this.compAndLocDetailsFormSubmitted = false
        if(action === 'view'){
        
        this.candidateRepoService.selectedCandidate = res.data
        this.router.navigate(['candidate-repo/profile'])
        }
        if(action==='add'){
          this.selectedTab = 'candidate-info'
          this.basicDetailsFormSubmitted = false
          this.profDetailsFormSubmitted = false
          this.skillsDetailsFormSubmitted = false
          this.compAndLocDetailsFormSubmitted = false
        }
        
        // Optionally show success message or redirect
      },
      error: (err) => {
        console.error('❌ Failed to update candidate:', err);
        this.toastService.show('Entered candidate details failed to upload','error','Data failed to upload')
        // Optionally show error message
      }
    });
    }
    }
  }

 updateObject(original: any, updated: any): any {
  for (const key in updated) {
    if (!updated.hasOwnProperty(key)) continue;

    const originalValue = original[key];
    const updatedValue = updated[key];

    if (
      typeof originalValue === 'object' &&
      originalValue !== null &&
      typeof updatedValue === 'object' &&
      updatedValue !== null &&
      !Array.isArray(updatedValue)
    ) {
      // Recursively update nested objects
      this.updateObject(originalValue, updatedValue);
    } else if (updatedValue !== undefined) {
      // Only update if value is explicitly provided (not undefined)
      original[key] = updatedValue;
    }
  }

  return original;
}


  formReset(value:string){
    if(value === 'Basic'){
      this.addCandidateFormBasicDetails.reset()
    }
    else if(value === 'Prof'){
      this.addCandidateFormProfDetails.reset()
    }
    else if(value === 'Skills'){
      this.addCandidateFormSkills.reset()
    }
    else if(value === 'CompLoc'){
      this.addCandidateFormCompensationLocation.reset()
    }
    
  }
  toggleActive(event : Event) {
    const target = event.currentTarget as HTMLElement;
    const tabValue = target.dataset['tab'];

    if(tabValue){
      this.selectedTab = tabValue;
      console.log(this.selectedTab);
    }
  }


 commaSeparatedEmailsValidator(): ValidatorFn {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const emails = value.split(',').map(e => e.trim());
    const invalidEmails = emails.filter(email => !emailRegex.test(email));

    return invalidEmails.length > 0 ? { invalidEmails: invalidEmails } : null;
  };
}

commaSeparatedMobilesValidator(): ValidatorFn {
  // Allows combinations of digits, +, -, (, ), and space — per value
  const mobileRegex = /^[\d+\-\s()]+$/;

  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) return null;

    const mobiles = value.split(',').map(m => m.trim());
    const invalidMobiles = mobiles.filter(mobile => !mobileRegex.test(mobile));

    return invalidMobiles.length > 0 ? { invalidMobiles } : null;
  };
}

}
