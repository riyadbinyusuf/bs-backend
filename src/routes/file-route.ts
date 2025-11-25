import express from 'express';
import { protectRoute } from '../middlewares/auth-middleware';
import upload from '../config/storage'
import { fileUpload } from '../controllers/file-controller';

const router = express.Router();


// Protected routes
// --------------------
router.post('/upload-single', protectRoute, upload.single('file'), fileUpload);

export default router;
