/*
  Warnings:

  - You are about to drop the column `amphurCode` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `analysisResult` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedValue` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `landAreaNgan` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `landAreaRai` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `landAreaWa` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `provinceCode` on the `title_deeds` table. All the data in the column will be lost.
  - You are about to drop the column `valuationData` on the `title_deeds` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `title_deeds` DROP COLUMN `amphurCode`,
    DROP COLUMN `analysisResult`,
    DROP COLUMN `estimatedValue`,
    DROP COLUMN `landAreaNgan`,
    DROP COLUMN `landAreaRai`,
    DROP COLUMN `landAreaWa`,
    DROP COLUMN `provinceCode`,
    DROP COLUMN `valuationData`,
    ADD COLUMN `titleDeedData` JSON NULL,
    MODIFY `imageUrl` VARCHAR(500) NULL;
