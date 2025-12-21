import express from 'express';
import validate from '../middlewares/validate.js';
import * as socialPostValidation from '../validations/socialPostValidation.js';
import { requireApiKey } from '../middlewares/auth.js';
import {
    getAllSocialPosts,
    getSocialPostById,
    bulkCreateSocialPosts,
} from '../controllers/socialPostController.js';

const router = express.Router();

// Public routes (user-facing)
router.get('/', validate(socialPostValidation.getSocialPosts), getAllSocialPosts);
router.get('/:id', validate(socialPostValidation.getSocialPost), getSocialPostById);

// Internal routes (API key protected for bulk ingestion)
router.post('/bulk', requireApiKey, validate(socialPostValidation.bulkCreateSocialPosts), bulkCreateSocialPosts);

export default router;
