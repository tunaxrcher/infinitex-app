/*
  Warnings:

  - You are about to drop the column `estimatedValue` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `valuationDate` on the `loans` table. All the data in the column will be lost.
  - You are about to drop the column `valuationResult` on the `loans` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `loan_applications` ADD COLUMN `estimatedValue` DECIMAL(15, 2) NULL,
    ADD COLUMN `valuationDate` DATETIME(0) NULL,
    ADD COLUMN `valuationResult` JSON NULL;

-- AlterTable
ALTER TABLE `loans` DROP COLUMN `estimatedValue`,
    DROP COLUMN `valuationDate`,
    DROP COLUMN `valuationResult`;
