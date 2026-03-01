/*
  Warnings:

  - You are about to drop the `file` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `filesystemitem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `folder` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `file` DROP FOREIGN KEY `File_fileSystemItemId_fkey`;

-- DropForeignKey
ALTER TABLE `filesystemitem` DROP FOREIGN KEY `FileSystemItem_ownerId_fkey`;

-- DropForeignKey
ALTER TABLE `filesystemitem` DROP FOREIGN KEY `FileSystemItem_parentId_fkey`;

-- DropForeignKey
ALTER TABLE `folder` DROP FOREIGN KEY `Folder_fileSystemItemId_fkey`;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ALTER COLUMN `storageLimit` DROP DEFAULT;

-- DropTable
DROP TABLE `file`;

-- DropTable
DROP TABLE `filesystemitem`;

-- DropTable
DROP TABLE `folder`;

-- CreateTable
CREATE TABLE `Node` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('FILE', 'FOLDER') NOT NULL,
    `key` VARCHAR(191) NULL,
    `size` INTEGER NULL,
    `mimeType` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `parentId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Node_key_key`(`key`),
    INDEX `Node_userId_idx`(`userId`),
    INDEX `Node_parentId_idx`(`parentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Node` ADD CONSTRAINT `Node_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Node` ADD CONSTRAINT `Node_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Node`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
