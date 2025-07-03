import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AddCandidateDetails } from 'src/modals/add-candidate-details-modal';
import { AddCandidateRequestModel } from 'src/modals/add-candidate-modal';
import { AddCandidateResponse } from 'src/modals/add-candidate-response-model';
import { AllCandidates, Candidate } from 'src/modals/all-candidate-modal';
import { CandidateImportRequestModel, CandidateImportResponseModel } from 'src/modals/candidate-import-modal'
import { DashboardSummaryModel } from 'src/modals/dashboard-summary-modal';
import { EditCandidateDetails } from 'src/modals/edit-candidate-details-modal';
import { CandidateProfile } from 'src/modals/edit-candidate-modal';
import { EditCandidateResponse } from 'src/modals/edit-candidate-response-modal';
import { NoticePeriodResponse } from 'src/modals/notice-period.model';
import { PositionResponse } from 'src/modals/position-modal';
import { CandidateReviewStatus, ReviewStatusResponse } from 'src/modals/reviewStatus-modal';
import { User, UserResponse } from 'src/modals/user-modal';
@Injectable({
  providedIn: 'root'
})
export class CandidateRepoService { 
  public selectedCandidate: any;
  public tableView :string = '';
  public tableEdit :string = '';
  public lastUrl: string = '';
  private apiUrl = `${environment.apiUrl}`
  private importUrl = `${environment.apiUrl}/candidates-repo/import`
  private addCandidateURL = `${environment.apiUrl}/candidates-repo/candidates`
  private getAllCandidatesUrl = `${environment.apiUrl}/candidates-repo/candidates/search-ssr`
  private getPositionsUrl = `${environment.apiUrl}/candidates-repo/import/Positions`
  private getNoticePeriodsUrl = `${environment.apiUrl}/candidates-repo/import/NoticePeriods`
  private reviewStatusUrl = `${environment.apiUrl}/candidates-repo/candidates`
  private editCandidateUrl=  `${environment.apiUrl}/candidates-repo/candidates`
  private getCandidateURL=  `${environment.apiUrl}/candidates-repo/candidates`
  private getDashboardSummaryUrl=  `${environment.apiUrl}/candidates-repo/import/DashboardSummary`

  private userInfoSubject = new BehaviorSubject<User>(null);
  userInfo$ = this.userInfoSubject.asObservable(); // For subscribers

  constructor(
    private http: HttpClient
  ) { }
  

    importExcelFile(importRequest: CandidateImportRequestModel) {
      const formData = new FormData();
        formData.append('file', importRequest.file);
        formData.append('templateName', importRequest.templateName);
        formData.append('importedBy', importRequest.importedBy.toString());
        formData.append('importedSource', importRequest.importedSource);
      
      const headers = new HttpHeaders({ accept: 'application/json' });

      return this.http.post<CandidateImportResponseModel>(this.importUrl, formData, {headers});
  }


  addCandidate(importRequest: AddCandidateDetails){
    const importData = importRequest
    console.log("Add Candidate Data", importData)
    const headers = new HttpHeaders({accept: 'application/json'});

    return this.http.post<AddCandidateResponse>(this.addCandidateURL, importData, {headers});
  }


  getAllCandidates(params: HttpParams){
    return this.http.get<AllCandidates>(this.getAllCandidatesUrl, { params })
  }


  getDashboardSummary(){
    return this.http.get<DashboardSummaryModel>(this.getDashboardSummaryUrl)
  }


  setUserInfo(userInfo: any) {
    this.userInfoSubject.next(userInfo);
  }

  getUserInfo() {
    return this.userInfoSubject.value;
  }
  
  fetchAndStoreUserInfo(email: string): Observable<UserResponse> {
  const encodedEmail = encodeURIComponent(email);
  const url = `${environment.apiUrl}/users/email/${encodedEmail}`;
  return this.http.get<UserResponse>(url).pipe(
    tap(res => {
      if (res && res.statusCode === 200) {
        this.setUserInfo(res.data);
      }
    }),
    catchError(err => {
      console.error("fetchAndStoreUserInfo --> Error", err);
      return throwError(() => err);
    })
  );
}


getPositions(): Observable<PositionResponse> {
  return this.http.get<PositionResponse>(this.getPositionsUrl);
}

getNoticePeriods(): Observable<NoticePeriodResponse> {
  return this.http.get<NoticePeriodResponse>(this.getNoticePeriodsUrl);
}

updateReviewStatus(candidateId: number, body: { reviewAction: string; reviewNotes: string, lastUpdatedBy:number}) {
    const url = `${this.reviewStatusUrl}/${candidateId}/review-status`;
    return this.http.post(url, body);
  }

editCandidate(candidateId: number, body:EditCandidateDetails) {
    const url = `${this.editCandidateUrl}/${candidateId}`;
    return this.http.post<EditCandidateResponse>(url, body);
  }


  getCandidate(candidateId: number){
    return this.http.get<any>(`${this.getCandidateURL}/${candidateId}`,)
  }

}
