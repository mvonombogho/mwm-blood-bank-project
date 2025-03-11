/**
 * Standard API response format
 * @param {boolean} success - Whether the request was successful
 * @param {object|array|null} data - Response data
 * @param {string|null} message - Response message (required for error responses)
 * @param {object|null} pagination - Pagination info if applicable
 * @returns {object} Formatted API response
 */
export function formatResponse(success, data = null, message = null, pagination = null) {
  const response = { success };
  
  if (data !== null) response.data = data;
  if (message !== null) response.message = message;
  if (pagination !== null) response.pagination = pagination;
  
  return response;
}

/**
 * Error handler for API routes
 * @param {Error} error - The error object
 * @param {object} res - Express response object
 * @returns {object} Formatted error response
 */
export function handleApiError(error, res) {
  console.error('API Error:', error);
  
  // Check for validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json(formatResponse(
      false,
      null,
      error.message
    ));
  }
  
  // Check for duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json(formatResponse(
      false,
      null,
      `Duplicate value for ${field}. This ${field} already exists.`
    ));
  }
  
  // Handle other errors
  return res.status(500).json(formatResponse(
    false,
    null,
    error.message || 'An unexpected error occurred'
  ));
}

/**
 * Validate pagination parameters
 * @param {object} query - Request query parameters
 * @returns {object} Validated and normalized pagination params
 */
export function validatePagination(query) {
  const { page = '1', limit = '10' } = query;
  
  // Parse and validate
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  
  return {
    page: isNaN(pageNum) || pageNum < 1 ? 1 : pageNum,
    limit: isNaN(limitNum) || limitNum < 1 ? 10 : (limitNum > 100 ? 100 : limitNum),
    skip: (isNaN(pageNum) || pageNum < 1 ? 0 : pageNum - 1) * (isNaN(limitNum) || limitNum < 1 ? 10 : limitNum)
  };
}

/**
 * Format pagination response
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total number of items
 * @returns {object} Formatted pagination object
 */
export function formatPagination(page, limit, total) {
  return {
    page,
    limit,
    total,
    pages: Math.ceil(total / limit)
  };
}
