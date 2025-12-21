import Joi from 'joi';

const companySchema = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().allow(null, ''),
    logo: Joi.string().uri().allow(null, ''),
    category: Joi.string().valid('global_mnc', 'global_startup', 'indian_startup').allow(null, ''),
});

export const getCompanies = {
    query: Joi.object().keys({
        category: Joi.string().valid('global_mnc', 'global_startup', 'indian_startup').allow(''),
    }),
};

export const createCompany = {
    body: companySchema,
};

export const bulkCreateCompanies = {
    body: Joi.array().items(companySchema).min(1),
};
