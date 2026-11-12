import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { patientQuerySchema, createPatientSchema } from "@/lib/validations";
import {
  paginatedResponse,
  successResponse,
  validationError,
  unauthorizedError,
  errorResponse,
} from "@/lib/api-response";
import * as patientService from "@/services/patient.service";

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

    const { id: doctorId } = await params;

    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const parsed = patientQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return validationError("Invalid query parameters", parsed.error.flatten().fieldErrors);
    }

    const { patients, total } = await patientService.getPatientsByDoctor(
      doctorId,
      parsed.data
    );

    return paginatedResponse(patients, {
      page: parsed.data.page,
      limit: parsed.data.limit,
      total,
    });
  } catch (error) {
    console.error("Get patients by doctor error:", error);
    return errorResponse("Internal server error");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const { id: doctorId } = await params;
    const body = await request.json();

    // Set doctorId from params
    const dataWithDoctor = { ...body, doctorId };
    const parsed = createPatientSchema.safeParse(dataWithDoctor);

    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.flatten().fieldErrors);
    }

    const patient = await patientService.createPatient(parsed.data, currentUser.name);

    return successResponse(patient, 201);
  } catch (error) {
    console.error("Create patient for doctor error:", error);
    return errorResponse("Internal server error");
  }
}
