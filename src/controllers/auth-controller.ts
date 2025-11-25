import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt";
import { logger } from "../utils/logger";
import { users } from "../models/schema";
import { db } from "../config/db";
import { eq } from "drizzle-orm";
import { validateUserBody } from "../validations/post-validation";

export const register = async (req: Request, res: Response) => {
  try {
    const payload = validateUserBody.parse(req.body);

    if (!payload) {
      return res.status(400).json({
        status: "error",
        message: "Invalid request data",
      });
    }

    const { firstName, lastName, email, password } = payload;

    // Check if user already exists
    const existingUser = (
      await db.select().from(users).where(eq(users.email, email)).limit(1)
    )[0];
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const insertedUser = await db
      .insert(users)
      .values({
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hashedPassword,
      })
      .returning();

    if (!insertedUser.length) {
      return res.status(500).json({
        status: "error",
        message: "Failed to create user",
      });
    }

    const user = insertedUser[0];

    // Generate tokens
    const accessToken = generateAccessToken(String(user.id));
    const refreshToken = generateRefreshToken(String(user.id));

    // Set refresh token as cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    logger.success(`New user registered: ${email}`);

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        user: {
          _id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    logger.error("Registration error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    // const user = users.find((u) => u.email === email);
    const user = (
      await db.select().from(users).where(eq(users.email, email)).limit(1)
    )[0];
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: "error",
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(String(user.id));
    const refreshToken = generateRefreshToken(String(user.id));

    // Set refresh token as cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    logger.success(`User logged in: ${email}`);

    res.json({
      status: "success",
      message: "Login successful",
      data: {
        user: {
          _id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
        accessToken,
      },
    });
  } catch (error) {
    logger.error("Login error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("refreshToken");

    logger.info("User logged out:", req.userId);

    res.json({
      status: "success",
      message: "Logout successful",
    });
  } catch (error) {
    logger.error("Logout error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (
      await db
        .select()
        .from(users)
        .where(eq(users.id, Number(req.userId)))
        .limit(1)
    )[0];

    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    res.json({
      status: "success",
      data: {
        user: {
          _id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (error) {
    logger.error("Get profile error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
};
