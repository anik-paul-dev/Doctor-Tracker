import connectDB from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { successResponse, unauthorizedError, errorResponse } from "@/lib/api-response";
import * as dashboardService from "@/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";

export async function GET() {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return unauthorizedError();
    }

    const [
      stats,
      specializationDistribution,
      patientsPerDoctor,
      monthlyTrend,
      recentActivity,
    ] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getSpecializationDistribution(),
      dashboardService.getPatientsPerDoctor(),
      dashboardService.getMonthlyTrend(),
      dashboardService.getRecentActivity(),
    ]);

    const dashboardData: DashboardData = {
      stats,
      specializationDistribution,
      patientsPerDoctor,
      monthlyTrend,
      recentActivity,
    };

    return successResponse(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Internal server error");
  }
}
