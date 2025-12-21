/**
 * Pagination utility for Prisma queries
 * Parses query params and returns Prisma-compatible pagination
 */

/**
 * Extract pagination params from request query
 * @param {object} query - Express req.query object
 * @param {object} options - Configuration options
 * @param {number} options.defaultLimit - Default page size (default: 20)
 * @param {number} options.maxLimit - Maximum page size (default: 100)
 * @returns {object} { skip, take, page, limit }
 */
export const getPagination = (query, options = {}) => {
    const { defaultLimit = 20, maxLimit = 100 } = options;

    let page = parseInt(query.page, 10) || 1;
    let limit = parseInt(query.limit, 10) || defaultLimit;

    // Ensure valid values
    page = Math.max(1, page);
    limit = Math.min(Math.max(1, limit), maxLimit);

    const skip = (page - 1) * limit;

    return {
        skip,
        take: limit,
        page,
        limit,
    };
};

/**
 * Create pagination metadata for response
 * @param {number} totalCount - Total number of records
 * @param {number} page - Current page
 * @param {number} limit - Page size
 * @returns {object} Pagination metadata
 */
export const getPaginationMeta = (totalCount, page, limit) => {
    const totalPages = Math.ceil(totalCount / limit);

    return {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
    };
};
