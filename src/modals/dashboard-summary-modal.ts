export interface DashboardSummaryModel{
statusCode: 200,
message: string,
data: DashboardSummaryDataModel
}



export interface DashboardSummaryDataModel{
    touchedCount: number,
    unTouchedCount: number,
    profileSourceManualCount: number,
    profileSourceImportedCount: number,
    profileSourceConsultancyCount: number,
    reviewInterestedCount: number,
    reviewNotInterestedCount: number,
    reviewCNRCount: number    
}

