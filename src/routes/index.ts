import express from 'express';
import authRoutes from './auth-route';
import postRoutes from './post-route';
import fileRoutes from './file-route';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/files', fileRoutes);

export default router;
