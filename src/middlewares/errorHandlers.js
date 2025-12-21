import httpStatus from 'http-status';

export const notFoundHandler = (req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({ code: httpStatus.NOT_FOUND, message: "Not Found" });
};

export const errorHandler = (err, req, res, next) => {
  console.error(err);
  const statusCode = err.statusCode || httpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || httpStatus[statusCode];

  res.status(statusCode).json({
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

