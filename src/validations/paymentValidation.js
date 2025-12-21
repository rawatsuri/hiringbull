import Joi from 'joi';

export const createOrder = {
    body: Joi.object().keys({
        amount: Joi.number().min(1).required(),
        userId: Joi.string().uuid().required()
    }),
};

export const verifyPayment = {
    body: Joi.object().keys({
        razorpay_order_id: Joi.string().required(),
        razorpay_payment_id: Joi.string().required(),
        razorpay_signature: Joi.string().required(),
        userId: Joi.string().uuid().required()
    }),
};
