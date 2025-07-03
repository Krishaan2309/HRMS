export interface ReviewStatusResponse{
  statusCode: 200,
  message: string,
  data: CandidateReviewStatus

}



export interface CandidateReviewStatus{
    reviewAction: string,
    reviewNotes: string
    lastUpdatedBy: number,
  }