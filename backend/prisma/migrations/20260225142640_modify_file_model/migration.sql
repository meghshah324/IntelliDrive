/*
  Warnings:

  - You are about to drop the column `storageURL` on the `file` table. All the data in the column will be lost.
  - You are about to drop the column `fileId` on the `filesystemitem` table. All the data in the column will be lost.
  - You are about to drop the column `folderId` on the `filesystemitem` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[fileSystemItemId]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fileSystemItemId]` on the table `Folder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fileSystemItemId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FileSystemItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fileSystemItemId` to the `Folder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `filesystemitem` DROP FOREIGN KEY `FileSystemItem_fileId_fkey`;

-- DropForeignKey
ALTER TABLE `filesystemitem` DROP FOREIGN KEY `FileSystemItem_folderId_fkey`;

-- DropIndex
DROP INDEX `FileSystemItem_fileId_key` ON `filesystemitem`;

-- DropIndex
DROP INDEX `FileSystemItem_folderId_key` ON `filesystemitem`;

-- AlterTable
ALTER TABLE `file` DROP COLUMN `storageURL`,
    ADD COLUMN `fileSystemItemId` VARCHAR(191) NOT NULL,
    ADD COLUMN `storageKey` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `filesystemitem` DROP COLUMN `fileId`,
    DROP COLUMN `folderId`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `folder` ADD COLUMN `fileSystemItemId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `File_fileSystemItemId_key` ON `File`(`fileSystemItemId`);

-- CreateIndex
CREATE UNIQUE INDEX `Folder_fileSystemItemId_key` ON `Folder`(`fileSystemItemId`);

-- AddForeignKey
ALTER TABLE `File` ADD CONSTRAINT `File_fileSystemItemId_fkey` FOREIGN KEY (`fileSystemItemId`) REFERENCES `FileSystemItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Folder` ADD CONSTRAINT `Folder_fileSystemItemId_fkey` FOREIGN KEY (`fileSystemItemId`) REFERENCES `FileSystemItem`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `filesystemitem` RENAME INDEX `FileSystemItem_ownerId_fkey` TO `FileSystemItem_ownerId_idx`;

-- RenameIndex
ALTER TABLE `filesystemitem` RENAME INDEX `FileSystemItem_parentId_fkey` TO `FileSystemItem_parentId_idx`;
