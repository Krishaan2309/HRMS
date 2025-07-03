export interface EditCandidateDetails {
  basicInfo: BasicInfoEdit;
  professionalDetails: ProfessionalDetails;
  skills: Skills;
  compensationLocation: CompensationLocation;
}

export interface BasicInfoEdit {
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  profileReceivedDate: string; // ISO date string
  profileSource: string;
  subSource: string;
  employmentType: string;
  lastUpdatedBy: number;
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
  currentGross: number;
  expectedGross: number;
  currentLocation: string;
  preferredLocation: string;
  preferredArea: string;
  noticePeriodId: number;
}
