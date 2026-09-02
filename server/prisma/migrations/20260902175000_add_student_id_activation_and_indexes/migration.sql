-- AlterTable
ALTER TABLE `otp_verifications` MODIFY `type` ENUM('SIGNUP', 'ACTIVATION', 'LOGIN', 'RESET_PASSWORD') NOT NULL DEFAULT 'SIGNUP';

-- AlterTable
ALTER TABLE `students` DROP COLUMN `password`,
    ADD COLUMN `is_activated` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `student_id` VARCHAR(191) NOT NULL,
    MODIFY `email` VARCHAR(191) NULL,
    MODIFY `is_active` BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX `students_student_id_key` ON `students`(`student_id`);

-- CreateIndex
CREATE INDEX `students_student_id_idx` ON `students`(`student_id`);

-- CreateIndex
CREATE INDEX `students_last_name_first_name_idx` ON `students`(`last_name`, `first_name`);
