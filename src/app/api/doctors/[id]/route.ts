import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updateDoctorSchema } from "@/lib/validations";
import {
  successResponse,
  validationError,
  unauthorizedError,
  notFoundError,
  errorResponse,
} from "@/lib/api-response";
import * as doctorService from "@/services/doctor.service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const { id } = await params;
    const doctor = await doctorService.getDoctorById(id);

    if (!doctor) {
      return notFoundError("Doctor not found");
    }

    return successResponse(doctor);
  } catch (error) {
    console.error("Get doctor error:", error);
    return errorResponse("Internal server error");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateDoctorSchema.safeParse(body);

    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.flatten().fieldErrors);
    }

    const doctor = await doctorService.updateDoctor(id, parsed.data);

    if (!doctor) {
      return notFoundError("Doctor not found");
    }

    return successResponse(doctor);
  } catch (error) {
    console.error("Update doctor error:", error);
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const { id } = await params;
    const doctor = await doctorService.deleteDoctor(id);

    if (!doctor) {
      return notFoundError("Doctor not found");
    }

    return successResponse({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Delete doctor error:", error);
    return errorResponse("Internal server error");
  }
}
