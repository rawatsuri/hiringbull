import express from 'express';
import validate from '../middlewares/validate.js';
import * as companyValidation from '../validations/companyValidation.js';
import { requireApiKey } from '../middlewares/auth.js';
import { getAllCompanies, createCompany, bulkCreateCompanies } from '../controllers/companyController.js';

const router = express.Router();

// Public routes
router.get('/', validate(companyValidation.getCompanies), getAllCompanies);

// Internal routes (API key protected)
router.post('/', requireApiKey, validate(companyValidation.createCompany), createCompany);
router.post('/bulk', requireApiKey, validate(companyValidation.bulkCreateCompanies), bulkCreateCompanies);

export default router;
