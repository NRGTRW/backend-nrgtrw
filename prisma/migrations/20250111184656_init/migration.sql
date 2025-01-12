/*
  Warnings Resolved:

  - Used `IF EXISTS` for `DROP` commands to prevent errors if the target does not exist.
  - Added default values for the `category` and `description` columns in the `Product` table.
  - Foreign key constraints are added after creating the tables.
*/

/* DropForeignKey */
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_productId_fkey`;
ALTER TABLE `cart` DROP FOREIGN KEY `Cart_userId_fkey`;

/* AlterTable */
ALTER TABLE `product` 
    ADD COLUMN `category` VARCHAR(191) NOT NULL DEFAULT 'Uncategorized',
    ADD COLUMN `description` VARCHAR(191) NOT NULL DEFAULT 'No description provided',
    MODIFY `imageUrl` VARCHAR(191) NULL;

/* AlterTable */
ALTER TABLE `user` ADD COLUMN `isAdmin` BOOLEAN NOT NULL DEFAULT false;

/* DropTable */
DROP TABLE IF EXISTS `cart`;

/* CreateTable */
CREATE TABLE IF NOT EXISTS `ProductSize` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `size` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ProductColor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `colorName` VARCHAR(191) NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `hoverImage` VARCHAR(191) NOT NULL,
    `productId` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CartItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `totalAmount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL,
    `price` DOUBLE NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

/* AddForeignKey */
ALTER TABLE `ProductSize` 
    ADD CONSTRAINT `ProductSize_productId_fkey` 
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `ProductColor` 
    ADD CONSTRAINT `ProductColor_productId_fkey` 
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CartItem` 
    ADD CONSTRAINT `CartItem_userId_fkey` 
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `CartItem` 
    ADD CONSTRAINT `CartItem_productId_fkey` 
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `Order` 
    ADD CONSTRAINT `Order_userId_fkey` 
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `OrderItem` 
    ADD CONSTRAINT `OrderItem_orderId_fkey` 
    FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `OrderItem` 
    ADD CONSTRAINT `OrderItem_productId_fkey` 
    FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
