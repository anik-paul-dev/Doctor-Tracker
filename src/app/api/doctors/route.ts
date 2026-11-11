import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { doctorQuerySchema, createDoctorSchema } from "@/lib/validations";
import {
  paginatedResponse,
  successResponse,
  validationError,
  unauthorizedError,
  errorResponse,
} from "@/lib/api-response";
import * as doctorService from "@/services/doctor.service";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryObj[key] = value;
    });

    const parsed = doctorQuerySchema.safeParse(queryObj);
    if (!parsed.success) {
      return validationError("Invalid query parameters", parsed.error.flatten().fieldErrors);
    }

    const { doctors, total } = await doctorService.getDoctors(parsed.data);

    return paginatedResponse(doctors, {
      page: parsed.data.page,
      limit: parsed.data.limit,
      total,
    });
  } catch (error) {
    console.error("Get doctors error:", error);
    return errorResponse("Internal server error");
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const body = await request.json();
    const parsed = createDoctorSchema.safeParse(body);

    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.flatten().fieldErrors);
    }

    const doctor = await doctorService.createDoctor(parsed.data);

    return successResponse(doctor, 201);
  } catch (error) {
    console.error("Create doctor error:", error);
    return errorResponse("Internal server error");
  }
}
