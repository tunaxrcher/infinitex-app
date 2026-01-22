-- AlterTable
ALTER TABLE `loan_applications` ADD COLUMN `deedMode` ENUM('SINGLE', 'MULTIPLE') NOT NULL DEFAULT 'SINGLE',
    ADD COLUMN `totalPropertyValue` DECIMAL(15, 2) NULL;

-- CreateTable
CREATE TABLE `title_deeds` (
    `id` VARCHAR(191) NOT NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `imageKey` VARCHAR(500) NULL,
    `deedNumber` VARCHAR(100) NULL,
    `provinceCode` VARCHAR(10) NULL,
    `provinceName` VARCHAR(100) NULL,
    `amphurCode` VARCHAR(10) NULL,
    `amphurName` VARCHAR(100) NULL,
    `parcelNo` VARCHAR(100) NULL,
    `landAreaRai` DECIMAL(10, 2) NULL,
    `landAreaNgan` DECIMAL(10, 2) NULL,
    `landAreaWa` DECIMAL(10, 2) NULL,
    `landAreaText` VARCHAR(100) NULL,
    `ownerName` VARCHAR(255) NULL,
    `landType` VARCHAR(100) NULL,
    `analysisResult` JSON NULL,
    `valuationData` JSON NULL,
    `estimatedValue` DECIMAL(15, 2) NULL,
    `latitude` VARCHAR(50) NULL,
    `longitude` VARCHAR(50) NULL,
    `linkMap` TEXT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updatedAt` DATETIME(0) NOT NULL,

    INDEX `title_deeds_applicationId_idx`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
