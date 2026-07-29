import { Router } from 'express';
import { getStories, createStory, likeStory, addComment } from '../controllers/storyController';

const router = Router();

// Routes prefix: /api/stories
router.get('/', getStories);
router.post('/', createStory);
router.post('/:id/like', likeStory);
router.post('/:id/comments', addComment);

export default router;
