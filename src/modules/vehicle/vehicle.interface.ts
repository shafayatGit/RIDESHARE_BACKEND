export interface ICreateVehicle {
  model: string;
  color: string;
  plate: string;
  seat_capacity: number;
}

export interface IUpdateVehicle {
  model?: string;
  color?: string;
  plate?: string;
  seat_capacity?: number;
}
