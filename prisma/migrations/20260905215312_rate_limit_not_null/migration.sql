/*
  Warnings:

  - Made the column `key` on table `rateLimit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `count` on table `rateLimit` required. This step will fail if there are existing NULL values in that column.
  - Made the column `lastRequest` on table `rateLimit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "rateLimit" ALTER COLUMN "key" SET NOT NULL,
ALTER COLUMN "count" SET NOT NULL,
ALTER COLUMN "lastRequest" SET NOT NULL;
