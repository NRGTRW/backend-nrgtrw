-- AlterTable
ALTER TABLE `product` MODIFY `imageUrl` TEXT NULL;

-- AlterTable
ALTER TABLE `productcolor` MODIFY `imageUrl` TEXT NOT NULL,
    MODIFY `hoverImage` TEXT NOT NULL;
