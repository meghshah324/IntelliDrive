/*
  Warnings:

  - Added the required column `storageLimit` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `storageLimit` INTEGER NOT NULL,
    ADD COLUMN `usedStorage` INTEGER NOT NULL DEFAULT 0;
