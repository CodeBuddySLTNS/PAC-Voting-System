/*
  Warnings:

  - You are about to drop the column `course` on the `classes` table. All the data in the column will be lost.
  - Added the required column `department_id` to the `classes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `classes` DROP COLUMN `course`,
    ADD COLUMN `department_id` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `departments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `acronym` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
