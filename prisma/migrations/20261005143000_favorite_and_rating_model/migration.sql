-- AlterTable
ALTER TABLE "user" ADD COLUMN     "ratingCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "favorite" (
    "id" TEXT NOT NULL,
    "passengerId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rating" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "raterId" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "favorite_passengerId_riderId_key" ON "favorite"("passengerId", "riderId");

-- CreateIndex
CREATE INDEX "favorite_passengerId_idx" ON "favorite"("passengerId");

-- CreateIndex
CREATE INDEX "favorite_riderId_idx" ON "favorite"("riderId");

-- CreateIndex
CREATE UNIQUE INDEX "rating_bookingId_key" ON "rating"("bookingId");

-- CreateIndex
CREATE INDEX "rating_riderId_idx" ON "rating"("riderId");

-- CreateIndex
CREATE INDEX "rating_raterId_idx" ON "rating"("raterId");

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_passengerId_fkey" FOREIGN KEY ("passengerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorite" ADD CONSTRAINT "favorite_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_raterId_fkey" FOREIGN KEY ("raterId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rating" ADD CONSTRAINT "rating_riderId_fkey" FOREIGN KEY ("riderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;