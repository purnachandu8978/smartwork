/**
 * Wraps async route handlers to catch errors and pass to next()
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Build pagination object from query params
 */
const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Build a paginated response
 */
const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

/**
 * Build MongoDB sort object from query
 */
const getSort = (sortBy = "createdAt", sortOrder = "desc") => ({
  [sortBy]: sortOrder === "asc" ? 1 : -1,
});

/**
 * Pick only allowed keys from an object
 */
const pick = (obj, keys) =>
  keys.reduce((acc, key) => {
    if (obj[key] !== undefined) acc[key] = obj[key];
    return acc;
  }, {});

/**
 * Omit keys from an object
 */
const omit = (obj, keys) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !keys.includes(k)));

module.exports = { asyncHandler, getPagination, paginatedResponse, getSort, pick, omit };
