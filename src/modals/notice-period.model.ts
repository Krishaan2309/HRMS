export interface NoticePeriodResponse {
  statusCode: number;
  message: string;
  data: NoticePeriod[];
}

export interface NoticePeriod {
  noticePeriodId: number;
  noticePeriodName: string;
}
