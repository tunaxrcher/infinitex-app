/*
  Warnings:

  - You are about to alter the column `deletedAt` on the `document_title_lists` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deletedAt` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deletedAt` on the `land_account_logs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deletedAt` on the `land_account_reports` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deletedAt` on the `land_accounts` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.

*/
-- AlterTable
ALTER TABLE `document_title_lists` MODIFY `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `documents` MODIFY `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `land_account_logs` MODIFY `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `land_account_reports` MODIFY `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `land_accounts` MODIFY `deletedAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `loan_installments` ADD COLUMN `filePayload` JSON NULL,
    ADD COLUMN `note` TEXT NULL,
    ADD COLUMN `paymentProofUploadedAt` DATETIME(0) NULL,
    ADD COLUMN `paymentProofUrl` VARCHAR(500) NULL,
    ADD COLUMN `refNo` VARCHAR(100) NULL;
