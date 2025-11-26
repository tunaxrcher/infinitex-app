-- AlterTable
ALTER TABLE `loan_applications` ADD COLUMN `interestRate` DECIMAL(5, 2) NULL,
    ADD COLUMN `operationFee` DECIMAL(15, 2) NULL DEFAULT 0,
    ADD COLUMN `otherFee` DECIMAL(15, 2) NULL DEFAULT 0,
    ADD COLUMN `termMonths` INTEGER NULL DEFAULT 48,
    ADD COLUMN `transferFee` DECIMAL(15, 2) NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `loans` ADD COLUMN `estimatedValue` DECIMAL(15, 2) NULL,
    ADD COLUMN `valuationDate` DATETIME(0) NULL,
    ADD COLUMN `valuationResult` JSON NULL;
