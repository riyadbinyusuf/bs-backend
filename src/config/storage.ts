// upload.ts
import express, { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import fs from 'fs';
import path from 'path';
import { S3Client } from '@aws-sdk/client-s3';
import { fileURLToPath } from 'url';
import { env } from '../utils/env';

const router = express.Router();

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --------------------
// Local storage setup
// --------------------
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.resolve(env.LOCAL_UPLOAD_PATH || 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// --------------------
// R2/S3 storage setup
// --------------------
const r2Config = new S3Client({
  region: env.R2_REGION,
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: env.R2_SECRET_ACCESS_KEY || '',
  },
});

const r2Storage = multerS3({
  s3: r2Config,
  bucket: env.R2_BUCKET_NAME || '',
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: (req, file, cb) => {
    cb(null, Date.now().toString() + '-' + file.originalname);
  },
});

// --------------------
// Choose storage
// --------------------
const getStorageEngine = () => {
  const provider = env.STORAGE_PROVIDER;
  switch (provider) {
    case 'r2':
      return r2Storage;
    case 'local':
    default:
      return localStorage;
  }
};

const upload = multer({ storage: getStorageEngine() });

export default upload;

