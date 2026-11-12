import connectDB from "@/lib/db";
import { getCurrentUser, removeTokenCookie } from "@/lib/auth";
import { successResponse, unauthorizedError, errorResponse } from "@/lib/api-response";
import * as authService from "@/services/auth.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      await removeTokenCookie();
      return unauthorizedError();
    }

    // Avoid a database round trip for anonymous page loads. This endpoint is
    // called by AuthProvider on every visit, including the public login page.
    await connectDB();

    const user = await authService.getUserById(currentUser.userId);
    if (!user) {
      await removeTokenCookie();
      return unauthorizedError("User not found");
    }

    return successResponse(user);
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Internal server error");
  }
}
