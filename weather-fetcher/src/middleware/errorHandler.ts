import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error("Error occurred:", {
    message: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  let statusCode = 500;
  let message = "Internal server error";

  const errorTypes: Record<string, { status: number; message: string }> = {
    ValidationError: { status: 400, message: "Validation error" },
    UnauthorizedError: { status: 401, message: "Unauthorized" },
  };

  if (errorTypes[error.name]) {
    const { status, message: errorMessage } = errorTypes[error.name];
    statusCode = status;
    message = errorMessage;
  } else if (error.message.toLowerCase().includes("not found")) {
    statusCode = 404;
    message = "Resource not found";
  }

  res.status(statusCode).json({
    success: false,
    message,
    error:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
    timestamp: new Date().toISOString(),
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
};
