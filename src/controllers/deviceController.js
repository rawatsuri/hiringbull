import httpStatus from 'http-status';
import prisma from '../prismaClient.js';
import { getClerkUserId } from '../middlewares/auth.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Add a device token for the authenticated user
 * POST /api/users/devices
 */
export const addDevice = catchAsync(async (req, res) => {
    const userId = getClerkUserId(req) || req.clerkUserId;

    if (!userId) {
        const error = new Error('User not authenticated');
        error.statusCode = httpStatus.UNAUTHORIZED;
        throw error;
    }

    const { token, type } = req.body;

    // Check if device already exists for this user
    const existingDevice = await prisma.device.findUnique({
        where: { token },
    });

    if (existingDevice) {
        if (existingDevice.userId === userId) {
            // Device already registered to this user, just return it
            return res.status(httpStatus.OK).json(existingDevice);
        } else {
            // Device registered to different user - update ownership
            const device = await prisma.device.update({
                where: { token },
                data: { userId, type },
            });
            return res.status(httpStatus.OK).json(device);
        }
    }

    // Create new device
    const device = await prisma.device.create({
        data: {
            token,
            type,
            userId,
        },
    });

    res.status(httpStatus.CREATED).json(device);
});

/**
 * Remove a device token for the authenticated user
 * DELETE /api/users/devices/:token
 */
export const removeDevice = catchAsync(async (req, res) => {
    const userId = getClerkUserId(req) || req.clerkUserId;

    if (!userId) {
        const error = new Error('User not authenticated');
        error.statusCode = httpStatus.UNAUTHORIZED;
        throw error;
    }

    const { token } = req.params;

    // Find device and verify ownership
    const device = await prisma.device.findUnique({
        where: { token },
    });

    if (!device) {
        const error = new Error('Device not found');
        error.statusCode = httpStatus.NOT_FOUND;
        throw error;
    }

    if (device.userId !== userId) {
        const error = new Error('Unauthorized to remove this device');
        error.statusCode = httpStatus.FORBIDDEN;
        throw error;
    }

    await prisma.device.delete({
        where: { token },
    });

    res.status(httpStatus.NO_CONTENT).send();
});

/**
 * Get all devices for the authenticated user
 * GET /api/users/devices
 */
export const getDevices = catchAsync(async (req, res) => {
    const userId = getClerkUserId(req) || req.clerkUserId;

    if (!userId) {
        const error = new Error('User not authenticated');
        error.statusCode = httpStatus.UNAUTHORIZED;
        throw error;
    }

    const devices = await prisma.device.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });

    res.status(httpStatus.OK).json(devices);
});
/**
 * Add a device token without authentication (for testing/initial registration)
 * POST /api/users/devices/public
 */
export const addDevicePublic = catchAsync(async (req, res) => {
    const { token, type, userId } = req.body;

    // Check if device already exists
    const existingDevice = await prisma.device.findUnique({
        where: { token },
    });

    if (existingDevice) {
        // Update device info if it exists
        const device = await prisma.device.update({
            where: { token },
            data: {
                userId: userId || existingDevice.userId,
                type: type || existingDevice.type
            },
        });
        return res.status(httpStatus.OK).json(device);
    }

    // Create new device
    const device = await prisma.device.create({
        data: {
            token,
            type,
            userId: userId || null,
        },
    });

    res.status(httpStatus.CREATED).json(device);
});
