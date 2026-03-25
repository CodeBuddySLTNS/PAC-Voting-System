import { AdminService } from "../services/admin.services";
import { Request, Response } from "express";

export const AdminController = {
  getAll: async (req: Request, res: Response) => {
    const admins = await AdminService.getAllAdmins();
    res.status(200).json({ admins });
  },

  create: async (req: Request, res: Response) => {
    const imageFilename = req.file?.filename;
    const admin = await AdminService.createAdmin(req.body, imageFilename);
    res.status(201).json({ message: "Admin created successfully", admin });
  },

  update: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid admin ID" });
      return;
    }

    const imageFilename = req.file?.filename;
    try {
      const admin = await AdminService.updateAdmin(id, req.body, imageFilename);
      res.status(200).json({ message: "Admin updated successfully", admin });
    } catch (error: any) {
      if (error.message === "Admin not found") {
        res.status(404).json({ message: "Admin not found" });
        return;
      }
      throw error;
    }
  },

  remove: async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string);
    if (isNaN(id)) {
      res.status(400).json({ message: "Invalid admin ID" });
      return;
    }

    try {
      await AdminService.deleteAdmin(id);
      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error: any) {
      if (error.message === "Admin not found") {
        res.status(404).json({ message: "Admin not found" });
        return;
      }
      throw error;
    }
  },
};
