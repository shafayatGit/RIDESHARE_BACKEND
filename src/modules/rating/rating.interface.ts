export interface ICreateRating {
  riderId: string;
  rating: number;
  review?: string;
}

export interface IRatingResponse {
  id: string;
  riderId: string;
  raterId: string;
  rating: number;
  review: string | null;
  createdAt: Date;
  updatedAt: Date;
  rater?: {
    id: string;
    name: string;
    image: string | null;
  };
}