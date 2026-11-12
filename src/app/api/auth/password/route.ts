import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  unauthorizedError,
  validationError,
  errorResponse,
  readJsonBody,
} from "@/lib/api-response";
import * as authService from "@/services/auth.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();
    await connectDB();

    const bodyResult = await readJsonBody(request);
    if (bodyResult.error) return bodyResult.error;
    const parsed = passwordSchema.safeParse(bodyResult.data);
    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.format());
    }

    await authService.changeUserPassword(
      currentUser.userId,
      parsed.data.currentPassword,
      parsed.data.newPassword
    );

    return successResponse({ message: "Password updated successfully" });
  } catch (error) {
    if (error instanceof Error && error.message === "Current password is incorrect") {
      return validationError(error.message);
    }
    console.error("PUT /api/auth/password error:", error);
    return errorResponse("Failed to update password");
  }
}

