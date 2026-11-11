import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, unauthorizedError, errorResponse } from "@/lib/api-response";
import * as authService from "@/services/auth.service";

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const user = await authService.getUserById(currentUser.userId);
    if (!user) {
      return unauthorizedError("User not found");
    }

    return successResponse(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Internal server error");
  }
}
