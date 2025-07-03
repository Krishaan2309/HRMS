export interface AllCandidates {
  statusCode: number;
  message: string;
  data: CandidateDataWrapper;
}

export interface CandidateDataWrapper {
  data: Candidate[];
  totalCount: number;
}

export interface Candidate {
  basicInfo: BasicInfo;
  professionalDetails: ProfessionalDetails;
  skills: Skills;
  compensationLocation: CompensationLocation;
  position: Position;
  reviewStatus: ReviewStatus;
  activity: Activity
}

export interface BasicInfo {
  candidateId: number;
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  profileReceivedDate: string;
  profileSource: string;
  subSource: string;
  employmentType: string;
  resume: string;
  isReviewed: boolean;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  importId: number;
  createdBy : number;
  lastUpdatedBy: number;
}

export interface ProfessionalDetails {
  profDetailId: number;
  candidateId: number;
  currentCompany: string;
  currentDesignation: string;
  positionId: number | null;
  experienceInYears: number;
  experienceInMonths: number;
  createdDateTime: string;
  lastUpdatedDateTime: string;
}

export interface Skills {
  skillId: number;
  candidateId: number;
  softwareWorked: string;
  candidateSkills: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
}

export interface CompensationLocation {
  compLocId: number;
  candidateId: number;
  currentCtc: number;
  expectedCtc: number;
  currentGross: number;
  expectedGross: number;
  noticePeriodId: string;
  currentLocation: string;
  preferredLocation: string;
  preferredArea: string;
  createdDateTime: string;
  lastUpdatedDateTime: string;
  noticePeriodName: string;
}

export interface Position {
  positionId: number;
  positionName: string;
}


export interface ReviewStatus {
  reviewStatusId: number;
  candidateId: number;
  reviewAction: string;
  reviewNotes: string;
  lastUpdatedUserId: number;
  lastUpdatedUserName: string;
}

export interface UserDetails {
    createdUserId: number,
    lastUpdatedUserId: number,
    createdUserName: string,
    lastUpdatedUserName: string
  }

  export interface Activity{
    profileAddedDateTime:string,
    profileAddedBy:string,
    profileReviewedDateTime:string,
    profileReviewedBy:string;
  }