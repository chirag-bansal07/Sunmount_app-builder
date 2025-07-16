-- AlterTable
ALTER TABLE `product` ADD PRIMARY KEY (`product_code`);

-- DropIndex
DROP INDEX `Product_product_code_key` ON `product`;

-- CreateTable
CREATE TABLE `WorkInProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batch_number` VARCHAR(191) NOT NULL,
    `raw_materials` JSON NOT NULL,
    `output` JSON NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `start_date` DATETIME(3) NOT NULL,
    `end_date` DATETIME(3) NULL,
    `product_code` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `WorkInProgress_batch_number_key`(`batch_number`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkInProgress` ADD CONSTRAINT `WorkInProgress_product_code_fkey` FOREIGN KEY (`product_code`) REFERENCES `Product`(`product_code`) ON DELETE RESTRICT ON UPDATE CASCADE;
