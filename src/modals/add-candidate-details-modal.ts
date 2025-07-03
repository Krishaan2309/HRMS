export interface AddCandidateDetails {
  basicInfo: BasicInfo;
  professionalDetails: ProfessionalDetails;
  skills: Skills;
  compensationLocation: CompensationLocation;
}

export interface BasicInfo {
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  profileReceivedDate: string; // ISO date string
  profileSource: string;
  subSource: string;
  employmentType: string;
  createdBy: number;
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
