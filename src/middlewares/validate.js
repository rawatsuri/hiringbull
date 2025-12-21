import Joi from 'joi';
import httpStatus from 'http-status';
import { pick } from '../utils/pick.js'; // We might need a pick utility, or I can implement it inline if simple

const validate = (schema) => (req, res, next) => {
    // We can validate params, query, and body
    const validSchema = pick(schema, ['params', 'query', 'body']);
    const object = pick(req, Object.keys(validSchema));

    const { value, error } = Joi.compile(validSchema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(object);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return res.status(httpStatus.BAD_REQUEST).json({ error: errorMessage });
    }

    Object.assign(req, value);
    return next();
};

export default validate;
