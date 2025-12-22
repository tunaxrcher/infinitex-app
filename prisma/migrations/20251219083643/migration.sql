/*
  Warnings:

  - You are about to drop the column `firstName` on the `user_profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `user_profiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user_profiles` DROP COLUMN `firstName`,
    DROP COLUMN `lastName`,
    ADD COLUMN `fullName` VARCHAR(500) NULL;
