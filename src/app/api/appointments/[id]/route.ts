import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedError,
  validationError,
  notFoundError,
  errorResponse,
  readJsonBody,
} from "@/lib/api-response";
import { updateAppointmentSchema } from "@/lib/validations";
import * as appointmentService from "@/services/appointment.service";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();
    await connectDB();

    const { id } = await params;
    const appointment = await appointmentService.getAppointmentById(id);
    if (!appointment) return notFoundError("Appointment not found");

    return successResponse(appointment);
  } catch (error) {
    console.error("GET /api/appointments/[id] error:", error);
    return errorResponse("Internal server error");
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();
    await connectDB();

    const { id } = await params;
    const bodyResult = await readJsonBody(request);
    if (bodyResult.error) return bodyResult.error;
    const parsed = updateAppointmentSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.format());
    }

    const updated = await appointmentService.updateAppointment(
      id,
      parsed.data,
      currentUser.name
    );
    if (!updated) return notFoundError("Appointment not found");

    return successResponse(updated);
  } catch (error) {
    console.error("PUT /api/appointments/[id] error:", error);
    return errorResponse("Failed to update appointment");
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();
    await connectDB();

    const { id } = await params;
    const deleted = await appointmentService.deleteAppointment(
      id,
      currentUser.name
    );
    if (!deleted) return notFoundError("Appointment not found");

    return successResponse({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/appointments/[id] error:", error);
    return errorResponse("Failed to delete appointment");
  }
}
