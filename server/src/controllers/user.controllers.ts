import { UserService } from "../services/user.services";
import { Request, Response } from "express";

export const UserController = {
  getAllStudents: async (req: Request, res: Response) => {
    const students = await UserService.getAllStudents();
    res.status(200).json({ students });
  },

  toggleStudentStatus: async (req: Request, res: Response) => {
    const studentId = parseInt(req.params.id as string);
    if (isNaN(studentId)) {
      res.status(400).json({ message: "Invalid student ID" });
      return;
    }

    try {
      const updatedStudent = await UserService.toggleStudentStatus(studentId);
      res.status(200).json({
        message: "Student status updated successfully",
        student: updatedStudent,
      });
    } catch (error: any) {
      if (error.message === "Student not found") {
        res.status(404).json({ message: "Student not found" });
        return;
      }
      throw error;
    }
  },
};

