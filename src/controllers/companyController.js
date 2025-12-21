import prisma from '../prismaClient.js';
import httpStatus from 'http-status';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Get all companies with optional category filtering
 */
export const getAllCompanies = catchAsync(async (req, res) => {
    const { category } = req.query;

    const where = {};
    if (category) {
        where.category = category;
    }

    const companies = await prisma.company.findMany({
        where,
        orderBy: { name: 'asc' },
    });

    res.status(httpStatus.OK).json(companies);
});

/**
 * Create a single company
 */
export const createCompany = catchAsync(async (req, res) => {
    const { name, description, logo, category } = req.body;
    if (await prisma.company.findUnique({ where: { name } })) {
        res.status(httpStatus.BAD_REQUEST).json({ message: "Company already exists" });
        return;
    }
    const company = await prisma.company.create({
        data: { name, description, logo, category }
    });
    res.status(httpStatus.CREATED).json(company);
});

/**
 * Bulk create companies (internal use)
 */
export const bulkCreateCompanies = catchAsync(async (req, res) => {
    const companiesData = req.body;

    const count = await prisma.company.createMany({
        data: companiesData,
        skipDuplicates: true,
    });

    res.status(httpStatus.CREATED).json({
        message: "Bulk insert completed",
        count: count.count
    });
});
