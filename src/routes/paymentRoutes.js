import express from 'express';
import validate from '../middlewares/validate.js';
import * as paymentValidation from '../validations/paymentValidation.js';
import { requireAuth } from '../middlewares/auth.js';
import { createOrder, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes (require authentication)
router.post('/order', requireAuth, validate(paymentValidation.createOrder), createOrder);
router.post('/verify', requireAuth, validate(paymentValidation.verifyPayment), verifyPayment);

export default router;
