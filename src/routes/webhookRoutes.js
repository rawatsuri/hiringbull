import express from 'express';
import bodyParser from 'body-parser';
import { handleClerkWebhook } from '../controllers/webhookController.js';

const router = express.Router();

// Clerk webhooks need the raw body for Svix signature verification
// We'll use bodyParser.json() here specifically for this route
router.post('/clerk', bodyParser.json({
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}), handleClerkWebhook);

export default router;
