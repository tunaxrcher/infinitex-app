/*
  Warnings:

  - You are about to drop the column `landNumber` on the `loan_applications` table. All the data in the column will be lost.
  - You are about to drop the column `propertyArea` on the `loan_applications` table. All the data in the column will be lost.
  - You are about to drop the column `propertyLocation` on the `loan_applications` table. All the data in the column will be lost.
  - You are about to drop the column `propertyType` on the `loan_applications` table. All the data in the column will be lost.
  - You are about to drop the column `titleDeedData` on the `loan_applications` table. All the data in the column will be lost.
  - You are about to drop the column `titleDeedImage` on the `loan_applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `loan_applications` DROP COLUMN `landNumber`,
    DROP COLUMN `propertyArea`,
    DROP COLUMN `propertyLocation`,
    DROP COLUMN `propertyType`,
    DROP COLUMN `titleDeedData`,
    DROP COLUMN `titleDeedImage`;
