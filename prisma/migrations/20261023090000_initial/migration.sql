
-- Migration initiale GrowthOS KashVoix Pro

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "pinCode" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'fr',
  "tier" TEXT NOT NULL DEFAULT 'FREE',
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL,
  "deletedAt" BIGINT,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key"
ON "User"("phone");

CREATE TABLE IF NOT EXISTS "Category" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" BIGINT NOT NULL,
  "updatedAt" BIGINT NOT NULL,
  "deletedAt" BIGINT,
  CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Transaction" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "type" TEXT NOT NULL,
  "date" BIGINT NOT NULL,
  "note" TEXT,
  "entrySource" TEXT NOT NULL,
  "rawVoiceText" TEXT,
  "updatedAt" BIGINT NOT NULL,
  "deletedAt" BIGINT,
  CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Transaction_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Transaction_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "Transaction_userId_updatedAt_idx"
ON "Transaction"("userId", "updatedAt");
