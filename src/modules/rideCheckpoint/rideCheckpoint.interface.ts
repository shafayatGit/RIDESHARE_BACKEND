import type { CheckpointType } from "../../generated/prisma/enums";

export interface ICreateRideCheckpoint {
  rideId: string;
  type: CheckpointType;
  address: string;
  lat: number;
  lng: number;
  sequenceOrder?: number;
  estimatedTime?: Date;
}

export interface IUpdateRideCheckpoint {
  type?: CheckpointType;
  address?: string;
  lat?: number;
  lng?: number;
  sequenceOrder?: number;
  estimatedTime?: Date;
}
