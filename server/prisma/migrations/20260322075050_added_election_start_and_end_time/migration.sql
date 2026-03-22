/*
  Warnings:

  - A unique constraint covering the columns `[academic_year_id,name]` on the table `elections` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `elections_name_key` ON `elections`;

-- AlterTable
ALTER TABLE `elections` ADD COLUMN `end_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `start_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX `elections_academic_year_id_name_key` ON `elections`(`academic_year_id`, `name`);

-- AddForeignKey
ALTER TABLE `votes` ADD CONSTRAINT `votes_student_id_fkey` FOREIGN KEY (`student_id`) REFERENCES `students`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
