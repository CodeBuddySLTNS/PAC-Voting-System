import { UserService } from "../services/user.services";
import { Request, Response } from "express";

export const UserController = {
  getAllStudents: async (req: Request, res: Response) => {
    const students = await UserService.getAllStudents();
    res.status(200).json({ students });
  },

  makeAllStudentsEligible: async (req: Request, res: Response) => {
    const departmentId = req.query?.departmentId
      ? parseInt(req.query.departmentId as string)
      : undefined;
    const yearLevelId = req.query?.yearLevelId
      ? parseInt(req.query.yearLevelId as string)
      : undefined;

    const result = await UserService.makeAllStudentsEligible({
      departmentId,
      yearLevelId,
    });

    res.status(200).json({
      message: "All students marked as eligible to vote",
      updatedCount: result.count,
    });
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

  updateStudent: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid student ID" });
      return;
    }

    const imageFilename = req.file?.filename;
    try {
      const student = await UserService.updateStudent(id, req.body, imageFilename);
      res.status(200).json({ message: "Student updated successfully", student });
    } catch (error: any) {
      if (error.message === "Student not found") {
        res.status(404).json({ message: "Student not found" });
        return;
      }
      if (error.message === "Email already in use") {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
      throw error;
    }
  },

  updateMyProfile: async (req: Request, res: Response) => {
    const user = res.locals.user;
    if (!user || user.role === "admin" || !user.id) {
      res.status(403).json({ message: "Only students can update their profile this way" });
      return;
    }
    
    // We already know user.id is the studentId because it's a student finding their own profile
    const studentId = user.id;

    const imageFilename = req.file?.filename;
    
    try {
      const student = await UserService.updateMyProfile(studentId, req.body, imageFilename);
      res.status(200).json({ message: "Profile updated successfully", student });
    } catch (error: any) {
      res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
  },
  importStudents: async (req: Request, res: Response) => {
    const { students, defaultDepartmentId, defaultYearLevelId } = req.body;
    if (!students || !Array.isArray(students)) {
      res.status(400).json({ message: "Invalid students array in request body" });
      return;
    }

    const { StudentImportService } = await import(
      "../services/student-import.services"
    );
    const summary = await StudentImportService.importStudents(students, {
      departmentId: defaultDepartmentId
        ? Number(defaultDepartmentId)
        : undefined,
      yearLevelId: defaultYearLevelId
        ? Number(defaultYearLevelId)
        : undefined,
    });

    res.status(200).json({
      message: "Student masterlist processed successfully",
      summary,
    });
  },
};
