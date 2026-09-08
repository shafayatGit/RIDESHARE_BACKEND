export interface IJoinRidePayload {
  rideId: string;
}

export interface ISendMessagePayload {
  rideId: string;
  content: string;
}

export interface IMarkReadPayload {
  rideId: string;
  messageIds: string[];
}
