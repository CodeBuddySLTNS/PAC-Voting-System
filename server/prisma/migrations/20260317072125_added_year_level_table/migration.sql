/*
  Warnings:

  - You are about to drop the column `class_id` on the `students` table. All the data in the column will be lost.
  - You are about to drop the column `is_verified` on the `students` table. All the data in the column will be lost.
  - You are about to drop the `classes` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `department_id` to the `students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year_level_id` to the `students` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `students` DROP FOREIGN KEY `students_class_id_fkey`;

-- DropIndex
DROP INDEX `students_class_id_fkey` ON `students`;

-- AlterTable
ALTER TABLE `students` DROP COLUMN `class_id`,
    DROP COLUMN `is_verified`,
    ADD COLUMN `department_id` INTEGER NOT NULL,
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `year_level_id` INTEGER NOT NULL;

-- DropTable
DROP TABLE `classes`;

-- CreateTable
CREATE TABLE `year_level` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `year` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_year_level_id_fkey` FOREIGN KEY (`year_level_id`) REFERENCES `year_level`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
