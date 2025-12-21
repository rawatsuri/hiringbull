import prisma from '../prismaClient.js';
import httpStatus from 'http-status';
import { getPagination, getPaginationMeta } from '../utils/pagination.js';

const catchAsync = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Get all jobs with filtering and pagination
 * Query params: segment, companyId, page, limit
 */
export const getAllJobs = catchAsync(async (req, res) => {
    const { segment, companyId } = req.query;
    const { skip, take, page, limit } = getPagination(req.query);

    // Build filter
    const where = {};
    if (segment) {
        where.segment = segment;
    }
    if (companyId) {
        where.companyId = companyId;
    }

    // Get total count for pagination
    const totalCount = await prisma.job.count({ where });

    // Get paginated jobs
    const jobs = await prisma.job.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        include: {
            companyRel: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                },
            },
        },
    });

    const pagination = getPaginationMeta(totalCount, page, limit);

    res.status(httpStatus.OK).json({
        data: jobs,
        pagination,
    });
});

/**
 * Get a single job by ID
 */
export const getJobById = catchAsync(async (req, res) => {
    const { id } = req.params;
    const job = await prisma.job.findUnique({
        where: { id },
        include: {
            companyRel: {
                select: {
                    id: true,
                    name: true,
                    logo: true,
                    description: true,
                },
            },
        },
    });

    if (!job) {
        return res.status(httpStatus.NOT_FOUND).json({ message: 'Job not found' });
    }

    res.status(httpStatus.OK).json(job);
});

/**
 * Bulk create jobs (internal/admin use only)
 * Protected by API key middleware
 */
export const bulkCreateJobs = catchAsync(async (req, res) => {
    const jobsData = req.body;

    const count = await prisma.job.createMany({
        data: jobsData,
        skipDuplicates: true,
    });

    res.status(httpStatus.CREATED).json({
        message: 'Bulk job creation completed',
        count: count.count,
    });
});
