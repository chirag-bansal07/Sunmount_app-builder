/*
  Warnings:

  - Made the column `bom` on table `order` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `bom` VARCHAR(191) NOT NULL;
