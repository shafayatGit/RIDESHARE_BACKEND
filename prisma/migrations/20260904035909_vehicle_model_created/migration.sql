-- CreateTable
CREATE TABLE "vehicle" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "seat_capacity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "vehicle" ADD CONSTRAINT "vehicle_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
