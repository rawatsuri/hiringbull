import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '../prismaClient.js';
import httpStatus from 'http-status';
import dotenv from 'dotenv';
dotenv.config();

// Initialize Razorpay only if keys are present to prevent server crash on startup
const instance = (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
    : null;

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

export const createOrder = catchAsync(async (req, res) => {
    if (!instance) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
            message: "Razorpay is not configured on the server."
        });
    }

    const { amount, userId } = req.body;
    // Amount is now guaranteed by validation middleware
    if (!amount) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: "Amount is required" });
    }

    const options = {
        amount: amount * 100, // Amount in lowest denomination (paise)
        currency: "INR",
        receipt: `receipt_order_${Date.now()}`,
    };

    const order = await instance.orders.create(options);

    if (!order) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send("Some error occured");
    }

    // Create pending payment record
    await prisma.payment.create({
        data: {
            orderId: order.id,
            amount: amount,
            userId: userId,
            status: 'PENDING'
        }
    });

    res.status(httpStatus.CREATED).json(order);
});

export const verifyPayment = catchAsync(async (req, res) => {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Update payment status
        await prisma.payment.updateMany({
            where: { orderId: razorpay_order_id },
            data: {
                paymentId: razorpay_payment_id,
                signature: razorpay_signature,
                status: 'SUCCESS'
            }
        });

        // Update User to Paid
        // Logic: 1 Year subscription from now
        await prisma.user.update({
            where: { id: userId },
            data: {
                isPaid: true,
                planExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
            }
        });

        res.status(httpStatus.OK).json({ message: "Payment Verified", success: true });
    } else {
        // Mark as failed
        await prisma.payment.updateMany({
            where: { orderId: razorpay_order_id },
            data: { status: 'FAILED' }
        });

        res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid Signature", success: false });
    }
});
