import type { RideStatus } from "../../generated/prisma/enums";

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
