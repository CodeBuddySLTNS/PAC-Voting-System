-- AlterTable
ALTER TABLE `candidates` ADD COLUMN `department_id` INTEGER NULL,
    ADD COLUMN `year_level_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_department_id_fkey` FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `candidates` ADD CONSTRAINT `candidates_year_level_id_fkey` FOREIGN KEY (`year_level_id`) REFERENCES `year_level`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
