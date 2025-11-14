/*
  Warnings:

  - You are about to alter the column `grantedAt` on the `admin_permissions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `expiresAt` on the `admin_sessions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `lastLoginAt` on the `admins` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `admins` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `admins` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `startDate` on the `banners` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `endDate` on the `banners` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `banners` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `coin_transactions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `document_title_lists` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `document_title_lists` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `docDate` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `docFileDate` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `documents` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `land_account_logs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `land_account_logs` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `land_account_reports` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `land_account_reports` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `land_accounts` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `land_accounts` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `submittedAt` on the `loan_applications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `reviewedAt` on the `loan_applications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `loan_applications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `loan_applications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `dueDate` on the `loan_installments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `paidDate` on the `loan_installments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `loan_installments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `nextPaymentDate` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `contractDate` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `expiryDate` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `loans` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `readAt` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `notifications` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `dueDate` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `paidDate` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `createdAt` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `payments` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `validFrom` on the `privileges` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `validUntil` on the `privileges` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `privileges` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `deliveredAt` on the `reward_redemptions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `rewards` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `expiresAt` on the `sessions` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `system_config` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `dateOfBirth` on the `user_profiles` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `user_profiles` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `lastOtpSentAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `lastLoginAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.
  - You are about to alter the column `updatedAt` on the `users` table. The data in that column could be lost. The data in that column will be cast from `DateTime(3)` to `DateTime(0)`.

*/
-- AlterTable
ALTER TABLE `admin_permissions` MODIFY `grantedAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `admin_sessions` MODIFY `expiresAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `admins` MODIFY `lastLoginAt` DATETIME(0) NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `banners` MODIFY `startDate` DATETIME(0) NULL,
    MODIFY `endDate` DATETIME(0) NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `coin_transactions` MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0);

-- AlterTable
ALTER TABLE `document_title_lists` MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `documents` MODIFY `docDate` DATETIME(0) NOT NULL,
    MODIFY `docFileDate` DATETIME(0) NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `land_account_logs` MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `land_account_reports` MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `land_accounts` MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `loan_applications` MODIFY `submittedAt` DATETIME(0) NULL,
    MODIFY `reviewedAt` DATETIME(0) NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `loan_installments` MODIFY `dueDate` DATETIME(0) NOT NULL,
    MODIFY `paidDate` DATETIME(0) NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `loans` MODIFY `nextPaymentDate` DATETIME(0) NOT NULL,
    MODIFY `contractDate` DATETIME(0) NOT NULL,
    MODIFY `expiryDate` DATETIME(0) NOT NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `notifications` MODIFY `readAt` DATETIME(0) NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `payments` MODIFY `dueDate` DATETIME(0) NOT NULL,
    MODIFY `paidDate` DATETIME(0) NULL,
    MODIFY `createdAt` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `privileges` MODIFY `validFrom` DATETIME(0) NULL,
    MODIFY `validUntil` DATETIME(0) NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `reward_redemptions` MODIFY `deliveredAt` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `rewards` MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `sessions` MODIFY `expiresAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `system_config` MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `user_profiles` MODIFY `dateOfBirth` DATETIME(0) NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `lastOtpSentAt` DATETIME(0) NULL,
    MODIFY `lastLoginAt` DATETIME(0) NULL,
    MODIFY `updatedAt` DATETIME(0) NOT NULL;
