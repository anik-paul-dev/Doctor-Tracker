import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  paginatedResponse,
  successResponse,
  unauthorizedError,
  validationError,
  errorResponse,
} from "@/lib/api-response";
import { appointmentQuerySchema, createAppointmentSchema } from "@/lib/validations";
import * as appointmentService from "@/services/appointment.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();

    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    const parsedQuery = appointmentQuerySchema.safeParse(queryParams);
    if (!parsedQuery.success) {
      return validationError("Invalid query parameters", parsedQuery.error.format());
    }

    const result = await appointmentService.getAppointments(parsedQuery.data);
    return paginatedResponse(result.appointments, {
      page: result.pagination.page,
      limit: result.pagination.limit,
      total: result.pagination.total,
    });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();

    const body = await request.json();
    const parsed = createAppointmentSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.format());
    }

    const appointment = await appointmentService.createAppointment(
      parsed.data,
      currentUser.name
    );
    return successResponse(appointment, 201);
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return errorResponse("Failed to create appointment");
  }
}
