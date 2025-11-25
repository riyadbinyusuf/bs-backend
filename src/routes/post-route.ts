import express from 'express';
import { protectRoute } from '../middlewares/auth-middleware';
import { createComment, createPost, getPostsComments, getPostsFeed } from '../controllers/post-controller';

const router = express.Router();


// Protected routes
router.post('/create', protectRoute, createPost);
router.get('/', protectRoute, getPostsFeed);
router.get('/:postId/comments', protectRoute, getPostsComments);
router.post('/:postId/create-comment', protectRoute, createComment);

export default router;
