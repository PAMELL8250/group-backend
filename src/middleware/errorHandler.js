import { ApiResponse } from "../utils/ApiResponse.js";

const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  ApiResponse.error(res, message, statusCode);
};

export default errorHandler;