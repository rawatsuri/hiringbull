import express from 'express';
import validate from '../middlewares/validate.js';
import * as deviceValidation from '../validations/deviceValidation.js';
import { requireAuth } from '../middlewares/auth.js';
import { addDevice, removeDevice, getDevices, addDevicePublic } from '../controllers/deviceController.js';

const router = express.Router();

// All device routes require authentication
router.post('/', requireAuth, validate(deviceValidation.addDevice), addDevice);
router.post('/public', validate(deviceValidation.addDevicePublic), addDevicePublic);
router.get('/', requireAuth, getDevices);
router.delete('/:token', requireAuth, validate(deviceValidation.removeDevice), removeDevice);

export default router;
