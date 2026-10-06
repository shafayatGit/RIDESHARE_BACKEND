import type { CheckpointType, RideStatus } from "../../generated/prisma/enums";

export interface IRideCheckpointInput {
  type: CheckpointType;
  address: string;
  lat: number;
  lng: number;
  /** Defaults to the checkpoint's position in the array (1-based). */
  sequenceOrder?: number;
  estimatedTime?: Date;
}

export interface ICreateRide {
  vehicleId: string;
  originAddress: string;
  originLat: number;
  originLng: number;
  destinationAddress: string;
  destinationLat: number;
  destinationLng: number;
  departureTime: Date;
  totalSeats: number;
  pricePerSeat: number;
  isFemaleOnly?: boolean;
  /** Created in the same transaction as the ride. */
  checkpoints?: IRideCheckpointInput[];
}

export interface IUpdateRide {
  vehicleId?: string;
  originAddress?: string;
  originLat?: number;
  originLng?: number;
  destinationAddress?: string;
  destinationLat?: number;
  destinationLng?: number;
  departureTime?: Date;
  totalSeats?: number;
  availableSeats?: number;
  pricePerSeat?: number;
  status?: RideStatus;
  isFemaleOnly?: boolean;
}

/** The route to price, in the same order the checkpoints are created in. */
export interface IEstimateRide {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  /** Intermediate pickups, in travel order. */
  stops?: Array<{ lat: number; lng: number }>;
}

export type RateSource = "RIDE_AVERAGE" | "DEFAULT_PER_MILE";

export interface IRideEstimate {
  /** Total length of the route across origin, stops and destination, in miles. */
  distanceMiles: number;
  /** Price per mile the suggestion was derived from. */
  ratePerMile: number;
  rateSource: RateSource;
  /** How many rides the market average was taken from. Zero on fallback. */
  sampleRideCount: number;
  /** What the driver should charge per seat. */
  suggestedPricePerSeat: number;
}
