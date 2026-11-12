import { NextResponse } from "next/server";

interface SuccessResponse<T> {
  success: true;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code: string;
    details?: unknown;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function successResponse<T>(data: T, status: number = 200) {
  const body: SuccessResponse<T> = { success: true, data };
  return NextResponse.json(body, { status });
}

export function paginatedResponse<T>(
  data: T,
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  status: number = 200
) {
  const totalPages = Math.ceil(pagination.total / pagination.limit);
  const body: SuccessResponse<T> = {
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };
  return NextResponse.json(body, { status });
}

export function errorResponse(
  message: string,
  code: string = "INTERNAL_ERROR",
  status: number = 500,
  details?: unknown
) {
  const body: ErrorResponse = {
    success: false,
    error: { message, code, details },
  };
  return NextResponse.json(body, { status });
}

export function validationError(message: string, details?: unknown) {
  return errorResponse(message, "VALIDATION_ERROR", 400, details);
}

export async function readJsonBody(request: Request): Promise<
  | { data: unknown; error?: never }
  | { data?: never; error: ReturnType<typeof validationError> }
> {
  try {
    return { data: await request.json() };
  } catch {
    return { error: validationError("Request body must contain valid JSON") };
  }
}

export function unauthorizedError(message: string = "Unauthorized") {
  return errorResponse(message, "UNAUTHORIZED", 401);
}

export function notFoundError(message: string = "Resource not found") {
  return errorResponse(message, "NOT_FOUND", 404);
}

export function conflictError(message: string) {
  return errorResponse(message, "CONFLICT", 409);
}

