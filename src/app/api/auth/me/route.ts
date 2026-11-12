import { getCurrentUser, removeTokenCookie } from "@/lib/auth";
import { successResponse, unauthorizedError, errorResponse } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      await removeTokenCookie();
      return unauthorizedError();
    }

    // getCurrentUser verifies the signed, HttpOnly session token. Its signed
    // identity claims are sufficient here; fetching MongoDB on every app load
    // made the entire dashboard wait for a database round trip.
    return successResponse({
      userId: currentUser.userId,
      email: currentUser.email,
      name: currentUser.name,
      role: currentUser.role,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return errorResponse("Internal server error");
  }
}
