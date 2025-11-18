-- CreateTable
CREATE TABLE `real_investment` (
    `id` VARCHAR(191) NOT NULL,
    `investment` DECIMAL(20, 2) NOT NULL,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,
    `deletedAt` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
