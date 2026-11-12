import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { updatePatientSchema } from "@/lib/validations";
import {
  successResponse,
  validationError,
  unauthorizedError,
  notFoundError,
  errorResponse,
  readJsonBody,
} from "@/lib/api-response";
import * as patientService from "@/services/patient.service";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }
    await connectDB();

    const { id } = await params;
    const patient = await patientService.getPatientById(id);

    if (!patient) {
      return notFoundError("Patient not found");
    }

    return successResponse(patient);
  } catch (error) {
    console.error("Get patient error:", error);
    return errorResponse("Internal server error");
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }
    await connectDB();

    const { id } = await params;
    const bodyResult = await readJsonBody(request);
    if (bodyResult.error) return bodyResult.error;
    const parsed = updatePatientSchema.safeParse(bodyResult.data);

    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.flatten().fieldErrors);
    }

    const patient = await patientService.updatePatient(id, parsed.data, currentUser.name);

    if (!patient) {
      return notFoundError("Patient not found");
    }

    return successResponse(patient);
  } catch (error) {
    console.error("Update patient error:", error);
    return errorResponse("Internal server error");
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }
    await connectDB();

    const { id } = await params;
    const patient = await patientService.deletePatient(id, currentUser.name);

    if (!patient) {
      return notFoundError("Patient not found");
    }

    return successResponse({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Delete patient error:", error);
    return errorResponse("Internal server error");
  }
}
