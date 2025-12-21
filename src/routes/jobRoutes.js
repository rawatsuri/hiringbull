import express from 'express';
import validate from '../middlewares/validate.js';
import * as jobValidation from '../validations/jobValidation.js';
import { requireApiKey } from '../middlewares/auth.js';
import {
    getAllJobs,
    getJobById,
    bulkCreateJobs,
} from '../controllers/jobController.js';

const router = express.Router();

// Public routes (user-facing)
router.get('/', validate(jobValidation.getJobs), getAllJobs);
router.get('/:id', validate(jobValidation.getJob), getJobById);

// Internal routes (API key protected for bulk ingestion)
router.post('/bulk', requireApiKey, validate(jobValidation.bulkCreateJobs), bulkCreateJobs);

export default router;
