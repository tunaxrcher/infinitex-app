/*
  Warnings:

  - You are about to drop the column `userId` on the `audit_logs` table. All the data in the column will be lost.
  - You are about to alter the column `reviewedBy` on the `loan_applications` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(191)`.
  - You are about to alter the column `phoneNumber` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(20)`.
  - The values [ADMIN] on the enum `users_userType` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `agent_customers` DROP FOREIGN KEY `agent_customers_agentId_fkey`;

-- DropForeignKey
ALTER TABLE `agent_customers` DROP FOREIGN KEY `agent_customers_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `coin_transactions` DROP FOREIGN KEY `coin_transactions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `loan_applications` DROP FOREIGN KEY `loan_applications_agentId_fkey`;

-- DropForeignKey
ALTER TABLE `loan_applications` DROP FOREIGN KEY `loan_applications_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `loan_installments` DROP FOREIGN KEY `loan_installments_loanId_fkey`;

-- DropForeignKey
ALTER TABLE `loans` DROP FOREIGN KEY `loans_agentId_fkey`;

-- DropForeignKey
ALTER TABLE `loans` DROP FOREIGN KEY `loans_applicationId_fkey`;

-- DropForeignKey
ALTER TABLE `loans` DROP FOREIGN KEY `loans_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_installmentId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_loanId_fkey`;

-- DropForeignKey
ALTER TABLE `payments` DROP FOREIGN KEY `payments_userId_fkey`;

-- DropForeignKey
ALTER TABLE `reward_redemptions` DROP FOREIGN KEY `reward_redemptions_rewardId_fkey`;

-- DropForeignKey
ALTER TABLE `reward_redemptions` DROP FOREIGN KEY `reward_redemptions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `sessions` DROP FOREIGN KEY `sessions_userId_fkey`;

-- DropForeignKey
ALTER TABLE `user_profiles` DROP FOREIGN KEY `user_profiles_userId_fkey`;

-- AlterTable
ALTER TABLE `audit_logs` DROP COLUMN `userId`,
    ADD COLUMN `adminId` VARCHAR(255) NULL;

-- AlterTable
ALTER TABLE `loan_applications` MODIFY `reviewedBy` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `users` MODIFY `phoneNumber` VARCHAR(20) NOT NULL,
    MODIFY `userType` ENUM('CUSTOMER', 'AGENT') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `admins` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `firstName` VARCHAR(255) NOT NULL,
    `lastName` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPER_ADMIN', 'LOAN_OFFICER', 'CUSTOMER_SERVICE', 'FINANCE', 'CONTENT_MANAGER') NOT NULL DEFAULT 'LOAN_OFFICER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_permissions` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `permission` ENUM('VIEW_APPLICATIONS', 'APPROVE_APPLICATIONS', 'REJECT_APPLICATIONS', 'VIEW_LOANS', 'CREATE_LOANS', 'UPDATE_LOANS', 'DELETE_LOANS', 'VIEW_USERS', 'CREATE_USERS', 'UPDATE_USERS', 'DELETE_USERS', 'MANAGE_AGENTS', 'VIEW_PAYMENTS', 'PROCESS_PAYMENTS', 'REFUND_PAYMENTS', 'MANAGE_BANNERS', 'MANAGE_PRIVILEGES', 'MANAGE_REWARDS', 'MANAGE_SYSTEM_CONFIG', 'VIEW_AUDIT_LOGS', 'VIEW_REPORTS', 'EXPORT_DATA') NOT NULL,
    `grantedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `grantedBy` VARCHAR(255) NULL,

    INDEX `admin_permissions_adminId_idx`(`adminId`),
    UNIQUE INDEX `admin_permissions_adminId_permission_key`(`adminId`, `permission`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `adminId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `deviceInfo` VARCHAR(500) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_sessions_token_key`(`token`),
    INDEX `admin_sessions_adminId_idx`(`adminId`),
    INDEX `admin_sessions_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `agent_customers_agentId_idx` ON `agent_customers`(`agentId`);

-- CreateIndex
CREATE INDEX `audit_logs_adminId_idx` ON `audit_logs`(`adminId`);

-- CreateIndex
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs`(`entity`);

-- CreateIndex
CREATE INDEX `audit_logs_createdAt_idx` ON `audit_logs`(`createdAt`);

-- CreateIndex
CREATE INDEX `banners_isActive_idx` ON `banners`(`isActive`);

-- CreateIndex
CREATE INDEX `banners_sortOrder_idx` ON `banners`(`sortOrder`);

-- CreateIndex
CREATE INDEX `coin_transactions_type_idx` ON `coin_transactions`(`type`);

-- CreateIndex
CREATE INDEX `loan_applications_status_idx` ON `loan_applications`(`status`);

-- CreateIndex
CREATE INDEX `loan_applications_reviewedBy_idx` ON `loan_applications`(`reviewedBy`);

-- CreateIndex
CREATE INDEX `loan_installments_loanId_idx` ON `loan_installments`(`loanId`);

-- CreateIndex
CREATE INDEX `loan_installments_dueDate_idx` ON `loan_installments`(`dueDate`);

-- CreateIndex
CREATE INDEX `loans_status_idx` ON `loans`(`status`);

-- CreateIndex
CREATE INDEX `loans_loanNumber_idx` ON `loans`(`loanNumber`);

-- CreateIndex
CREATE INDEX `notifications_isRead_idx` ON `notifications`(`isRead`);

-- CreateIndex
CREATE INDEX `payments_status_idx` ON `payments`(`status`);

-- CreateIndex
CREATE INDEX `payments_referenceNumber_idx` ON `payments`(`referenceNumber`);

-- CreateIndex
CREATE INDEX `privileges_isActive_idx` ON `privileges`(`isActive`);

-- CreateIndex
CREATE INDEX `privileges_sortOrder_idx` ON `privileges`(`sortOrder`);

-- CreateIndex
CREATE INDEX `reward_redemptions_status_idx` ON `reward_redemptions`(`status`);

-- CreateIndex
CREATE INDEX `rewards_isActive_idx` ON `rewards`(`isActive`);

-- CreateIndex
CREATE INDEX `system_config_key_idx` ON `system_config`(`key`);

-- RenameIndex
ALTER TABLE `agent_customers` RENAME INDEX `agent_customers_customerId_fkey` TO `agent_customers_customerId_idx`;

-- RenameIndex
ALTER TABLE `coin_transactions` RENAME INDEX `coin_transactions_userId_fkey` TO `coin_transactions_userId_idx`;

-- RenameIndex
ALTER TABLE `loan_applications` RENAME INDEX `loan_applications_agentId_fkey` TO `loan_applications_agentId_idx`;

-- RenameIndex
ALTER TABLE `loan_applications` RENAME INDEX `loan_applications_customerId_fkey` TO `loan_applications_customerId_idx`;

-- RenameIndex
ALTER TABLE `loans` RENAME INDEX `loans_agentId_fkey` TO `loans_agentId_idx`;

-- RenameIndex
ALTER TABLE `loans` RENAME INDEX `loans_customerId_fkey` TO `loans_customerId_idx`;

-- RenameIndex
ALTER TABLE `notifications` RENAME INDEX `notifications_userId_fkey` TO `notifications_userId_idx`;

-- RenameIndex
ALTER TABLE `payments` RENAME INDEX `payments_installmentId_fkey` TO `payments_installmentId_idx`;

-- RenameIndex
ALTER TABLE `payments` RENAME INDEX `payments_loanId_fkey` TO `payments_loanId_idx`;

-- RenameIndex
ALTER TABLE `payments` RENAME INDEX `payments_userId_fkey` TO `payments_userId_idx`;

-- RenameIndex
ALTER TABLE `reward_redemptions` RENAME INDEX `reward_redemptions_rewardId_fkey` TO `reward_redemptions_rewardId_idx`;

-- RenameIndex
ALTER TABLE `reward_redemptions` RENAME INDEX `reward_redemptions_userId_fkey` TO `reward_redemptions_userId_idx`;
