-- CreateTable
CREATE TABLE "message" (
    "id" TEXT NOT NULL,
    "rideId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "message_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "message_rideId_idx" ON "message"("rideId");

-- CreateIndex
CREATE INDEX "message_senderId_idx" ON "message"("senderId");

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_rideId_fkey" FOREIGN KEY ("rideId") REFERENCES "ride"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message" ADD CONSTRAINT "message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
