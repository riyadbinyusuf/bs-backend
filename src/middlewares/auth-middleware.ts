import { NextFunction, Request, Response } from "express";
import { decodeToken } from "../utils/jwt";
import { logger } from "../utils/logger";

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const protectRoute = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let token;

    // Check for token in cookies or headers
    if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.headers?.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access denied. No token provided.",
      });
    }

    // Decode token
    const decoded = decodeToken(token);

    // Ensure decoded is an object and has userId
    if (
      typeof decoded === "object" &&
      decoded !== null &&
      "userId" in decoded
    ) {
      req.userId = (decoded as { userId: string }).userId;
      next();
    } else {
      return res.status(401).json({
        status: "error",
        message: "Invalid token payload",
      });
    }
  } catch (error) {
    logger.error("Auth middleware error:", error);
    return res.status(401).json({
      status: "error",
      message: "Invalid token",
    });
  }
};
