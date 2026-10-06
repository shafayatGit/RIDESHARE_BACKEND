const EARTH_RADIUS_MILES = 3958.8;

export interface Coordinate {
  lat: number;
  lng: number;
}

/** Great-circle distance between two coordinates, in miles. */
export const distanceInMiles = (
  from: Coordinate,
  to: Coordinate,
): number => {
  const dLat = ((to.lat - from.lat) * Math.PI) / 180;
  const dLng = ((to.lng - from.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from.lat * Math.PI) / 180) *
      Math.cos((to.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_MILES * c;
};

/**
 * Length of a route in miles: the sum of the straight-line distance between
 * each consecutive pair of points. Mirrors the client-side calculation in
 * `lib/format.ts` so the quoted price always matches the displayed distance.
 */
export const routeDistanceInMiles = (points: Coordinate[]): number =>
  points.reduce(
    (total, point, index) =>
      index === 0
        ? total
        : total + distanceInMiles(points[index - 1], point),
    0,
  );