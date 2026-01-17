import { Request, Response } from "express";
import { userService } from "../services/userService";

export class ProfileController {
  /**
   * Get the authenticated user's profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const user = await userService.findUserById(userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (err) {
      console.error("Get profile error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

export const profileController = new ProfileController();
