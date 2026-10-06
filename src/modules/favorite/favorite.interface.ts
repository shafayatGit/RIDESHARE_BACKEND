export interface ICreateFavorite {
  riderId: string;
}

export interface IFavoriteRider {
  id: string;
  name: string;
  image: string | null;
  isVerified: boolean;
  avgRatingAsDriver: number;
  ratingCount: number;
}

export interface IFavoriteResponse {
  id: string;
  passengerId: string;
  riderId: string;
  createdAt: Date;
  rider: IFavoriteRider;
}