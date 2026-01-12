import { Request, Response } from "express";
import { db } from "../db";
import { hashPassword, comparePassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { sendOTPEmail } from "../utils/mailer";

/* ---------------- HELPERS ---------------- */

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const otpExpiry = () =>
  new Date(Date.now() + 10 * 60 * 1000);

/* ---------------- REGISTER ---------------- */

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, display_name } = req.body;

    if (!email || !password || !display_name) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existing = await db.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);
    const otp = generateOTP();
    const expiresAt = otpExpiry();

    await db.query(
      `INSERT INTO users 
       (email, password_hash, display_name, otp_code, otp_expires_at, is_verified)
       VALUES ($1,$2,$3,$4,$5,false)`,
      [email, passwordHash, display_name, otp, expiresAt]
    );

    await sendOTPEmail(email, otp);

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- VERIFY OTP ---------------- */

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    const result = await db.query(
      `SELECT otp_code, otp_expires_at 
       FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    if (user.otp_code !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date(user.otp_expires_at) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    await db.query(
      `UPDATE users 
       SET is_verified=true, otp_code=NULL, otp_expires_at=NULL
       WHERE email=$1`,
      [email]
    );

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- LOGIN ---------------- */

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      `SELECT id, password_hash, is_verified 
       FROM users WHERE email=$1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user.is_verified) {
      return res.status(403).json({ message: "Verify email first" });
    }

    const valid = await comparePassword(password, user.password_hash);

    if (!valid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken({ userId: user.id });

    res.json({ token });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};
