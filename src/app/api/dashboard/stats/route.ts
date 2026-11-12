import { getCurrentUser } from "@/lib/auth";
import { successResponse, unauthorizedError, errorResponse } from "@/lib/api-response";
import * as dashboardService from "@/services/dashboard.service";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }
    const dashboardData = await dashboardService.getDashboardData();
    return successResponse(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Internal server error");
  }
}
