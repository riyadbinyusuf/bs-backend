import { z } from "zod";

export const validatePostBody = z.object({
  text: z.string().max(1000, "Text must be at most 1000 characters long").optional().nullable(),
  imageUrl: z.url("Invalid image URL").optional().nullable(),
  visibility: z.enum(["public", "private", "friends"]).default("public"),
});

export const validateCommentBody = z.object({
  commentText: z.string().min(1, "Text is required").max(1000, "Text must be at most 1000 characters long"),
  imageUrl: z.url("Invalid image URL").optional(),
});

export const validateUserBody = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be at most 50 characters long"),
  lastName: z.string().min(1, "Username is required").max(50, "Username must be at most 50 characters long"),
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});