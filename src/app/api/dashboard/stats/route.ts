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
      conditionDistribution,
      genderData,
      recentAdmissions,
      admissionTrend7,
      admissionTrend14,
      admissionTrend30,
      clinicHealth,
      smartInsights,
      todaySchedule,
      liveActivities,
    ] = await Promise.all([
      dashboardService.getDashboardStats(),
      dashboardService.getSpecializationDistribution(),
      dashboardService.getPatientsPerDoctor(),
      dashboardService.getMonthlyTrend(),
      dashboardService.getRecentActivity(),
      dashboardService.getConditionDistribution(),
      dashboardService.getGenderDistribution(),
      dashboardService.getRecentAdmissions(),
      dashboardService.getAdmissionTrend(7),
      dashboardService.getAdmissionTrend(14),
      dashboardService.getAdmissionTrend(30),
      dashboardService.getClinicHealth(),
      dashboardService.getSmartInsights(),
      dashboardService.getTodaySchedule(),
      dashboardService.getLiveActivities(),
    ]);

    const dashboardData: DashboardData = {
      stats,
      specializationDistribution,
      patientsPerDoctor,
      monthlyTrend,
      recentActivity,
      conditionDistribution,
      genderDistribution: genderData.distribution,
      averageAge: genderData.averageAge,
      recentAdmissions,
      admissionTrend7,
      admissionTrend14,
      admissionTrend30,
      clinicHealth,
      smartInsights,
      todaySchedule,
      liveActivities,
    };

    return successResponse(dashboardData);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return errorResponse("Internal server error");
  }
}
