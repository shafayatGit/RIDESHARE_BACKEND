-- Ratings now belong to the rider, not to an individual ride/booking.
-- A passenger keeps one rating per rider (overwritable), and the booking link
-- is kept only as optional provenance for which ride the rating came from.

-- Drop the per-booking uniqueness so a rating is not tied to a single ride.
DROP INDEX IF EXISTS "rating_bookingId_key";

-- The booking is now optional provenance rather than the rating's identity.
ALTER TABLE "rating" ALTER COLUMN "bookingId" DROP NOT NULL;

-- One rating per rider per rater, so the rider has a single overall score.
CREATE UNIQUE INDEX "rating_riderId_raterId_key" ON "rating" ("riderId", "raterId");

CREATE INDEX "rating_bookingId_idx" ON "rating" ("bookingId");