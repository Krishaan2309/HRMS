export interface Position {
  positionId: number;
  positionName: string;
}

export interface PositionResponse {
  statusCode: number;
  message: string;
  data: Position[];
}
