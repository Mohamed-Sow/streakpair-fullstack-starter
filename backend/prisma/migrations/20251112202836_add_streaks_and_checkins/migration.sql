-- CreateTable
CREATE TABLE "streak" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "frequency" TEXT NOT NULL DEFAULT 'daily',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "streak_member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streakId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "streak_member_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "streak" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "streak_member_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "check_in" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "streakId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "photoUrl" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "check_in_streakId_fkey" FOREIGN KEY ("streakId") REFERENCES "streak" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "check_in_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "streak_inviteCode_key" ON "streak"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "streak_member_streakId_userId_key" ON "streak_member"("streakId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "check_in_streakId_userId_date_key" ON "check_in"("streakId", "userId", "date");
