export interface CandidateProfile {
  basicInfo: BasicInfo;
  professionalDetails: ProfessionalDetails;
  skills: Skills;
  compensationLocation: CompensationLocation;
  reviewStatus: EditReviewStatus;
}

export interface BasicInfo {
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  profileReceivedDate: string; // ISO date string
  profileSource: string;
  subSource: string;
  employmentType: string;
}

export interface ProfessionalDetails {
  currentCompany: string;
  currentDesignation: string;
  positionId: number;
  experienceInYears: number;
  experienceInMonths: number;
}

export interface Skills {
  softwareWorked: string;
  candidateSkills: string;
}

export interface CompensationLocation {
  currentCtc: number;
  expectedCtc: number;
  noticePeriodDays: string;
  currentLocation: string;
  preferredLocation: string;
}

export interface EditReviewStatus {
  reviewAction: string;
  reviewNotes: string;
}
