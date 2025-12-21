import httpStatus from 'http-status';
import prisma from '../prismaClient.js';

export const paymentRequired = async (req, res, next) => {
    // Assuming req.userId is set by auth middleware (which we might not have yet? User didn't ask for Auth middleware but we have User logic)
    // For now we will assume userId is passed in headers or body for this specific flow if not auth, 
    // BUT typically this should follow auth. 
    // Let's assume req.headers['x-user-id'] for now if no auth middleware exists, or check req.user.

    const userId = req.headers['x-user-id'] || req.body.userId;

    if (!userId) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "User ID missing for payment check" });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return res.status(httpStatus.UNAUTHORIZED).json({ message: "User not found" });
    }

    if (user.isPaid) {
        // user.isPaid is true, check expiry if needed
        if (user.planExpiry && new Date() > user.planExpiry) {
            return res.status(httpStatus.PAYMENT_REQUIRED).json({ message: "Plan expired. Please pay again." });
        }
        return next();
    }

    return res.status(httpStatus.PAYMENT_REQUIRED).json({ message: "Payment required to access this resource" });
};
