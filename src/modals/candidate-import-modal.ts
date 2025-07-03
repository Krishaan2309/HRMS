export interface CandidateImportRequestModel{
templateName: string;
file:File;
importedBy:number;
importedSource:string;
}



export interface CandidateImportResponseModel{
    statusCode:number;
    message:string;
    data:CandidateImportResponseModelData
}


export interface CandidateImportResponseModelData{
    importId:number;
    totalRecords:number;
    duplicatesFound:number;
    insertedRecords:number;
}