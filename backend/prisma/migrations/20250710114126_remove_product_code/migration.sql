/*
  Warnings:

  - You are about to drop the column `product_code` on the `workinprogress` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `workinprogress` DROP FOREIGN KEY `WorkInProgress_product_code_fkey`;

-- DropIndex
DROP INDEX `WorkInProgress_product_code_fkey` ON `workinprogress`;

-- AlterTable
ALTER TABLE `workinprogress` DROP COLUMN `product_code`;
