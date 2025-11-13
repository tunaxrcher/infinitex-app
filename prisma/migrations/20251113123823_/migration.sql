-- AlterTable
ALTER TABLE `loan_applications` ADD COLUMN `hirePurchase` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `customerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `loans` ADD COLUMN `hirePurchase` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `landAccountId` INTEGER NULL,
    ADD COLUMN `landAccountName` VARCHAR(200) NULL,
    ADD COLUMN `linkMap` TEXT NULL,
    MODIFY `customerId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `userId` VARCHAR(191) NULL,
    MODIFY `loanId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `documents` (
    `id` VARCHAR(191) NOT NULL,
    `docType` ENUM('RECEIPT', 'PAYMENT_VOUCHER', 'DISCOUNT_NOTE', 'EXPENSE') NOT NULL,
    `docNumber` VARCHAR(100) NOT NULL,
    `docDate` DATETIME(3) NOT NULL,
    `title` TEXT NOT NULL,
    `price` DECIMAL(20, 2) NOT NULL,
    `cashFlowName` VARCHAR(200) NOT NULL,
    `employeeId` INTEGER NOT NULL DEFAULT 0,
    `username` VARCHAR(50) NULL,
    `docFile` TEXT NULL,
    `docFileDate` DATETIME(3) NULL,
    `docFileTime` VARCHAR(10) NULL,
    `docFilePrice` DECIMAL(20, 2) NULL,
    `filePath` TEXT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `documents_docType_idx`(`docType`),
    INDEX `documents_docNumber_idx`(`docNumber`),
    INDEX `documents_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `document_title_lists` (
    `id` VARCHAR(191) NOT NULL,
    `docType` ENUM('RECEIPT', 'PAYMENT_VOUCHER', 'DISCOUNT_NOTE', 'EXPENSE') NOT NULL,
    `title` TEXT NOT NULL,
    `note` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `document_title_lists_docType_idx`(`docType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `land_accounts` (
    `id` VARCHAR(191) NOT NULL,
    `accountName` VARCHAR(200) NOT NULL,
    `accountBalance` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `land_accounts_accountName_idx`(`accountName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `land_account_logs` (
    `id` VARCHAR(191) NOT NULL,
    `landAccountId` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(200) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `note` VARCHAR(200) NULL,
    `adminId` VARCHAR(191) NULL,
    `adminName` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `land_account_logs_landAccountId_idx`(`landAccountId`),
    INDEX `land_account_logs_adminId_idx`(`adminId`),
    INDEX `land_account_logs_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `land_account_reports` (
    `id` VARCHAR(191) NOT NULL,
    `landAccountId` VARCHAR(191) NOT NULL,
    `detail` VARCHAR(200) NOT NULL,
    `amount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `note` VARCHAR(200) NULL,
    `accountBalance` DECIMAL(15, 2) NULL DEFAULT 0,
    `adminId` VARCHAR(191) NULL,
    `adminName` VARCHAR(200) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `deletedAt` DATETIME(3) NULL,

    INDEX `land_account_reports_landAccountId_idx`(`landAccountId`),
    INDEX `land_account_reports_adminId_idx`(`adminId`),
    INDEX `land_account_reports_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
