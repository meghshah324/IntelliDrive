-- CreateTable
CREATE TABLE `Star` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Star_userId_idx`(`userId`),
    INDEX `Star_nodeId_idx`(`nodeId`),
    UNIQUE INDEX `Star_userId_nodeId_key`(`userId`, `nodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Star` ADD CONSTRAINT `Star_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Star` ADD CONSTRAINT `Star_nodeId_fkey` FOREIGN KEY (`nodeId`) REFERENCES `Node`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
