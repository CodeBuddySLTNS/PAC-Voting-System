/*
  Warnings:

  - You are about to drop the column `is_active` on the `academic_years` table. All the data in the column will be lost.
  - You are about to drop the column `academic_year_id` on the `candidates` table. All the data in the column will be lost.
  - You are about to drop the column `academic_year_id` on the `votes` table. All the data in the column will be lost.
  - You are about to drop the column `voter_class_id` on the `votes` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[student_id,election_id]` on the table `candidates` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[student_id,candidate_id,election_id]` on the table `votes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `election_id` to the `candidates` table without a default value. This is not possible if the table is not empty.
  - Added the required column `election_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voter_department_id` to the `votes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `voter_year_level_id` to the `votes` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `candidates` DROP FOREIGN KEY `candidates_academic_year_id_fkey`;

-- DropForeignKey
ALTER TABLE `candidates` DROP FOREIGN KEY `candidates_student_id_fkey`;

-- DropForeignKey
ALTER TABLE `votes` DROP FOREIGN KEY `votes_academic_year_id_fkey`;

-- DropForeignKey
ALTER TABLE `votes` DROP FOREIGN KEY `votes_student_id_fkey`;

-- DropIndex
DROP INDEX `candidates_academic_year_id_fkey` ON `candidates`;

-- DropIndex
DROP INDEX `candidates_student_id_academic_year_id_key` ON `candidates`;

-- DropIndex
DROP INDEX `votes_academic_year_id_fkey` ON `votes`;

-- DropIndex
DROP INDEX `votes_student_id_candidate_id_academic_year_id_key` ON `votes`;

-- AlterTable
ALTER TABLE `academic_years` DROP COLUMN `is_active`;

-- AlterTable
ALTER TABLE `candidates` DROP COLUMN `academic_year_id`,
    ADD COLUMN `election_id` INTEGER NOT NULL,
    ADD COLUMN `image_url` VARCHAR(191) NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    MODIFY `student_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `votes` DROP COLUMN `academic_year_id`,
    DROP COLUMN `voter_class_id`,
    ADD COLUMN `election_id` INTEGER NOT NULL,
    ADD COLUMN `voter_department_id` INTEGER NOT NULL,
    ADD COLUMN `voter_year_level_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `elections` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `academic_year_id` INTEGER NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `elections_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `candidates_student_id_election_id_key` ON `candidates`(`student_id`, `election_id`);

-- CreateIndex
CREATE UNIQUE INDEX `votes_student_id_candidate_id_election_id_key` ON `votes`(`student_id`, `candidate_id`, `election_id`);

-- AddForeignKey
ALTER TABLE `elections` ADD CONSTRAINT `elections_academic_year_id_fkey` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years`(`academic_year_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_election_id_fkey` FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;


-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_election_id_fkey` FOREIGN KEY (`election_id`) REFERENCES `elections`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
