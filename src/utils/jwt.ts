import jwt from "jsonwebtoken";
import { env } from "./env";

interface JwtPayload {
  userId: string;
}

export const generateAccessToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign({ userId }, env.JWT_SECRET as jwt.Secret, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
};

export const decodeToken = (token: string): JwtPayload | string => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (typeof decoded === "string") {
      return decoded;
    }
    if (decoded && typeof decoded === "object" && "userId" in decoded) {
      return { userId: (decoded as any).userId };
    }
    throw new Error("Invalid token payload");
  } catch (error) {
    throw new Error("Invalid token");
  }
};
