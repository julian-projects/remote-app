/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "User";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Agent" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "deviceId" TEXT NOT NULL,
    "status" INTEGER NOT NULL DEFAULT 0,
    "lastSeen" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_deviceId_key" ON "Agent"("deviceId");
