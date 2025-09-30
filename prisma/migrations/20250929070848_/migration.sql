-- CreateTable
CREATE TABLE `users` (
    `id` VARCHAR(191) NOT NULL,
    `phoneNumber` VARCHAR(191) NOT NULL,
    `pin` VARCHAR(255) NULL,
    `otpSecret` VARCHAR(255) NULL,
    `otpEnabled` BOOLEAN NOT NULL DEFAULT false,
    `lastOtpSentAt` DATETIME(3) NULL,
    `userType` ENUM('CUSTOMER', 'AGENT', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_phoneNumber_key`(`phoneNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_profiles` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(255) NULL,
    `lastName` VARCHAR(255) NULL,
    `idCardNumber` VARCHAR(13) NULL,
    `dateOfBirth` DATETIME(3) NULL,
    `address` TEXT NULL,
    `email` VARCHAR(255) NULL,
    `lineId` VARCHAR(255) NULL,
    `idCardFrontImage` VARCHAR(500) NULL,
    `idCardBackImage` VARCHAR(500) NULL,
    `preferredLanguage` VARCHAR(10) NOT NULL DEFAULT 'th',
    `notificationEnabled` BOOLEAN NOT NULL DEFAULT true,
    `coinBalance` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `user_profiles_userId_key`(`userId`),
    UNIQUE INDEX `user_profiles_idCardNumber_key`(`idCardNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `agent_customers` (
    `id` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `isActive` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `agent_customers_agentId_customerId_key`(`agentId`, `customerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_applications` (
    `id` VARCHAR(191) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NULL,
    `loanType` ENUM('HOUSE_LAND_MORTGAGE', 'CAR_REGISTRATION', 'FINX_PLUS') NOT NULL DEFAULT 'HOUSE_LAND_MORTGAGE',
    `status` ENUM('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'DRAFT',
    `currentStep` INTEGER NOT NULL DEFAULT 1,
    `completedSteps` JSON NOT NULL,
    `isNewUser` BOOLEAN NOT NULL DEFAULT false,
    `submittedByAgent` BOOLEAN NOT NULL DEFAULT false,
    `titleDeedImage` VARCHAR(500) NULL,
    `titleDeedData` JSON NULL,
    `supportingImages` JSON NOT NULL,
    `idCardFrontImage` VARCHAR(500) NULL,
    `idCardBackImage` VARCHAR(500) NULL,
    `requestedAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `approvedAmount` DECIMAL(15, 2) NULL,
    `maxApprovedAmount` DECIMAL(15, 2) NULL,
    `propertyType` VARCHAR(100) NULL,
    `propertyValue` DECIMAL(15, 2) NULL,
    `propertyArea` VARCHAR(100) NULL,
    `propertyLocation` TEXT NULL,
    `landNumber` VARCHAR(100) NULL,
    `ownerName` VARCHAR(255) NULL,
    `submittedAt` DATETIME(3) NULL,
    `reviewedAt` DATETIME(3) NULL,
    `reviewedBy` VARCHAR(255) NULL,
    `reviewNotes` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loans` (
    `id` VARCHAR(191) NOT NULL,
    `loanNumber` VARCHAR(50) NOT NULL,
    `customerId` VARCHAR(191) NOT NULL,
    `agentId` VARCHAR(191) NULL,
    `applicationId` VARCHAR(191) NOT NULL,
    `loanType` ENUM('HOUSE_LAND_MORTGAGE', 'CAR_REGISTRATION', 'FINX_PLUS') NOT NULL,
    `status` ENUM('ACTIVE', 'COMPLETED', 'DEFAULTED', 'CANCELLED') NOT NULL DEFAULT 'ACTIVE',
    `principalAmount` DECIMAL(15, 2) NOT NULL,
    `interestRate` DECIMAL(5, 2) NOT NULL,
    `termMonths` INTEGER NOT NULL,
    `monthlyPayment` DECIMAL(15, 2) NOT NULL,
    `currentInstallment` INTEGER NOT NULL DEFAULT 0,
    `totalInstallments` INTEGER NOT NULL,
    `remainingBalance` DECIMAL(15, 2) NOT NULL,
    `nextPaymentDate` DATETIME(3) NOT NULL,
    `contractDate` DATETIME(3) NOT NULL,
    `expiryDate` DATETIME(3) NOT NULL,
    `titleDeedNumber` VARCHAR(100) NULL,
    `collateralValue` DECIMAL(15, 2) NULL,
    `collateralDetails` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loans_loanNumber_key`(`loanNumber`),
    UNIQUE INDEX `loans_applicationId_key`(`applicationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `loan_installments` (
    `id` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `installmentNumber` INTEGER NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `principalAmount` DECIMAL(15, 2) NOT NULL,
    `interestAmount` DECIMAL(15, 2) NOT NULL,
    `totalAmount` DECIMAL(15, 2) NOT NULL,
    `isPaid` BOOLEAN NOT NULL DEFAULT false,
    `paidDate` DATETIME(3) NULL,
    `paidAmount` DECIMAL(15, 2) NULL,
    `isLate` BOOLEAN NOT NULL DEFAULT false,
    `lateDays` INTEGER NULL,
    `lateFee` DECIMAL(15, 2) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `loan_installments_loanId_installmentNumber_key`(`loanId`, `installmentNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `loanId` VARCHAR(191) NOT NULL,
    `installmentId` VARCHAR(191) NULL,
    `amount` DECIMAL(15, 2) NOT NULL,
    `paymentMethod` ENUM('QR_CODE', 'BARCODE', 'INTERNET_BANKING', 'BANK_TRANSFER') NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `referenceNumber` VARCHAR(100) NOT NULL,
    `transactionId` VARCHAR(100) NULL,
    `qrCode` TEXT NULL,
    `barcodeNumber` VARCHAR(50) NULL,
    `bankName` VARCHAR(100) NULL,
    `accountNumber` VARCHAR(50) NULL,
    `accountName` VARCHAR(255) NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `paidDate` DATETIME(3) NULL,
    `principalAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `interestAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `feeAmount` DECIMAL(15, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `payments_referenceNumber_key`(`referenceNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifications` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('PAYMENT_DUE', 'PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'LOAN_APPROVED', 'LOAN_REJECTED', 'SYSTEM_ANNOUNCEMENT', 'PROMOTION') NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `actionUrl` VARCHAR(500) NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `readAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `coin_transactions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('EARNED_SIGNUP', 'EARNED_ON_TIME_PAYMENT', 'EARNED_DAILY_TASK', 'EARNED_PROMOTION', 'REDEEMED_REWARD', 'EXPIRED') NOT NULL,
    `amount` INTEGER NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `loanId` VARCHAR(191) NULL,
    `rewardId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `rewards` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `coinCost` INTEGER NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `stockCount` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reward_redemptions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `rewardId` VARCHAR(191) NOT NULL,
    `coinSpent` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'PROCESSING', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `deliveryAddress` TEXT NULL,
    `trackingNumber` VARCHAR(100) NULL,
    `redeemedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `deliveredAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `banners` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `imageUrl` VARCHAR(500) NOT NULL,
    `actionUrl` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `targetUserTypes` JSON NOT NULL,
    `startDate` DATETIME(3) NULL,
    `endDate` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `privileges` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `imageUrl` VARCHAR(500) NULL,
    `actionUrl` VARCHAR(500) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `targetUserTypes` JSON NOT NULL,
    `coinCost` INTEGER NULL,
    `requiresLoan` BOOLEAN NOT NULL DEFAULT false,
    `validFrom` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `system_config` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(255) NOT NULL,
    `value` TEXT NOT NULL,
    `description` TEXT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `system_config_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `token` VARCHAR(500) NOT NULL,
    `deviceInfo` VARCHAR(500) NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_token_key`(`token`),
    INDEX `sessions_userId_idx`(`userId`),
    INDEX `sessions_token_idx`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(255) NULL,
    `action` VARCHAR(100) NOT NULL,
    `entity` VARCHAR(100) NOT NULL,
    `entityId` VARCHAR(255) NOT NULL,
    `oldData` JSON NULL,
    `newData` JSON NULL,
    `ipAddress` VARCHAR(45) NULL,
    `userAgent` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_profiles` ADD CONSTRAINT `user_profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_customers` ADD CONSTRAINT `agent_customers_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `agent_customers` ADD CONSTRAINT `agent_customers_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_applications` ADD CONSTRAINT `loan_applications_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_applications` ADD CONSTRAINT `loan_applications_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_agentId_fkey` FOREIGN KEY (`agentId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loans` ADD CONSTRAINT `loans_applicationId_fkey` FOREIGN KEY (`applicationId`) REFERENCES `loan_applications`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `loan_installments` ADD CONSTRAINT `loan_installments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_loanId_fkey` FOREIGN KEY (`loanId`) REFERENCES `loans`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_installmentId_fkey` FOREIGN KEY (`installmentId`) REFERENCES `loan_installments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `coin_transactions` ADD CONSTRAINT `coin_transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reward_redemptions` ADD CONSTRAINT `reward_redemptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reward_redemptions` ADD CONSTRAINT `reward_redemptions_rewardId_fkey` FOREIGN KEY (`rewardId`) REFERENCES `rewards`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
