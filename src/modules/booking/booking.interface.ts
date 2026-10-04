import type { BookingStatus } from "../../generated/prisma/enums";

export interface ICreateBooking {
  rideId: string;
  seatsBooked: number;
  pickupCheckpointId: string;
  dropCheckpointId: string;
}

export interface ICancelBooking {
  cancellationReason?: string;
}

export interface IBookingResponse {
  id: string;
  rideId: string;
  passengerId: string;
  pickupCheckpointId: string;
  dropCheckpointId: string;
  seatsBooked: number;
  costShareAmount: number;
  status: BookingStatus;
  bookingTime: Date;
  cancelledById: string | null;
  cancellationReason: string | null;
  cancelledAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  ride?: {
    id: string;
    originAddress: string;
    destinationAddress: string;
    departureTime: Date;
    status: string;
    driver: {
      id: string;
      name: string;
      image: string | null;
    };
    vehicle: {
      model: string;
      color: string;
      plate: string;
    };
  };
  passenger?: {
    id: string;
    name: string;
    image: string | null;
  };
  pickupCheckpoint?: {
    id: string;
    address: string;
    lat: number;
    lng: number;
    sequenceOrder: number;
  };
  dropCheckpoint?: {
    id: string;
    address: string;
    lat: number;
    lng: number;
    sequenceOrder: number;
  };
}
