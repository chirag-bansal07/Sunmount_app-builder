/*
  Warnings:

  - The primary key for the `product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[product_code]` on the table `Product` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `product` DROP PRIMARY KEY;

-- CreateIndex
CREATE UNIQUE INDEX `Product_product_code_key` ON `Product`(`product_code`);
