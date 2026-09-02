export interface User {
  id: number;
  studentId?: number | null;
  adminId?: number | null;
  email: string;
  studentIdNumber?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}
