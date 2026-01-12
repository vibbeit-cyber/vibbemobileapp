import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { db } from "../db";

export const getMe = async (req: AuthRequest, res: Response) => {
  const userId = req.user.userId;

  const result = await db.query(
    "SELECT display_name, email FROM users WHERE id = $1",
    [userId]
  );

  return res.json(result.rows[0]);
};
