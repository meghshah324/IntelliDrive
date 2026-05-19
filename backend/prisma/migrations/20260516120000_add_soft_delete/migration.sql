-- AlterTable: add soft-delete columns to Node
ALTER TABLE `Node`
  ADD COLUMN `isTrashed` BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `trashedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Node_isTrashed_idx` ON `Node`(`isTrashed`);
