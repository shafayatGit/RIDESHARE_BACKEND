-- A rating belongs to the rider, so deleting the booking it came from must not
-- delete the rating; the booking link is cleared instead.
ALTER TABLE "rating" DROP CONSTRAINT "rating_bookingId_fkey";

ALTER TABLE "rating"
  ADD CONSTRAINT "rating_bookingId_fkey"
  FOREIGN KEY ("bookingId") REFERENCES "booking" ("id")
  ON UPDATE CASCADE ON DELETE SET NULL;