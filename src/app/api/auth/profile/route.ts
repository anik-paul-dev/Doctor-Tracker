import { NextRequest } from "next/server";
import connectDB from "@/lib/db";
import { getCurrentUser, signToken, setTokenCookie } from "@/lib/auth";
import {
  successResponse,
  unauthorizedError,
  validationError,
  errorResponse,
} from "@/lib/api-response";
import * as authService from "@/services/auth.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
});

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) return unauthorizedError();
    await connectDB();

    const body = await request.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return validationError("Validation failed", parsed.error.format());
    }

    const updatedUser = await authService.updateUserProfile(
      currentUser.userId,
      parsed.data
    );

    // Refresh the JWT token with the new name/email
    const newToken = signToken({
      userId: currentUser.userId,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    });
    await setTokenCookie(newToken);

    return successResponse(updatedUser);
  } catch (error) {
    console.error("PUT /api/auth/profile error:", error);
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return errorResponse(message);
  }
}

