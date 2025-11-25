import express from 'express';
import { register, login, logout, getProfile } from '../controllers/auth-controller';
import { protectRoute } from '../middlewares/auth-middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.post('/logout', protectRoute, logout);
router.get('/profile', protectRoute, getProfile);

export default router;
