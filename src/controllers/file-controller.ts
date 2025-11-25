import { Request, Response } from "express"; // Import the base File type
import path from "path";
import { env } from "../utils/env";

export const fileUpload = async (req: Request, res: Response) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res
      .status(400)
      .json({ error: "No file uploaded or file failed to process." });
  }

  let fileUrl: string;
  const provider = env.STORAGE_PROVIDER;

  if (provider === "local") {
    fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      uploadedFile.filename
    }`;
  } else {
    // R2/S3
    // @ts-ignore
    fileUrl = env.R2_PUB_DEV_URL + `/${uploadedFile.key}`;
  }

  return res.json({
    message: "Upload successful",
    url: fileUrl,
    filename: uploadedFile.filename || path.basename(fileUrl),
    provider,
  });
};
