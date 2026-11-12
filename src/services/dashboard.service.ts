import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import Activity from "@/models/Activity";
import { formatRelativeTime } from "@/lib/utils";
import type {
  DashboardData,
  RecentActivity,
  RecentAdmission,
  ClinicHealth,
  SmartInsightItem,
  TodayScheduleItem,
  LiveActivityItem,
} from "@/types/dashboard";

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}
/** Load the dashboard with one facet aggregation per collection. This keeps
 * every dashboard section database-backed while avoiding dozens of round trips. */
export async function getDashboardData(): Promise<DashboardData> {
  await connectDB();

  const now = new Date();
  const firstDayThisMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const firstDayLastMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const twelveMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11, 1));
  const today = now.toISOString().slice(0, 10);
  const nextWeek = new Date(now);
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const nextWeekDate = nextWeek.toISOString().slice(0, 10);
  const recentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  recentStart.setUTCHours(0, 0, 0, 0);
  const trendStart = new Date(now);
  trendStart.setUTCHours(0, 0, 0, 0);
  trendStart.setUTCDate(trendStart.getUTCDate() - 29);
  const dailyStart = new Date(trendStart);
  dailyStart.setUTCDate(dailyStart.getUTCDate() - 12);

  const [doctorFacets, patientFacets, appointmentFacets, activityRows] = await Promise.all([
    Doctor.aggregate([
      { $facet: {
        stats: [{ $group: {
          _id: null,
          total: { $sum: 1 },
          current: { $sum: { $cond: [{ $gte: ["$createdAt", firstDayThisMonth] }, 1, 0] } },
          previous: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", firstDayLastMonth] }, { $lt: ["$createdAt", firstDayThisMonth] }] }, 1, 0] } },
        } }],
        specializations: [
          { $group: { _id: "$specialization", count: { $sum: 1 } } },
          { $project: { _id: 0, specialization: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ],
        roster: [
          { $sort: { patientCount: -1 } },
          { $limit: 10 },
          { $project: { _id: 0, doctorName: "$name", patientCount: 1, specialization: 1 } },
        ],
        monthly: [
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        ],
        daily: [
          { $match: { createdAt: { $gte: trendStart, $lte: now } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        ],
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          { $project: { _id: 1, name: 1, createdAt: 1 } },
        ],
      } },
    ]),
    Patient.aggregate([
      { $facet: {
        stats: [{ $group: {
          _id: null,
          total: { $sum: 1 },
          current: { $sum: { $cond: [{ $gte: ["$createdAt", firstDayThisMonth] }, 1, 0] } },
          previous: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", firstDayLastMonth] }, { $lt: ["$createdAt", firstDayThisMonth] }] }, 1, 0] } },
          averageAge: { $avg: "$age" },
        } }],
        conditions: [
          { $group: { _id: "$condition", count: { $sum: 1 } } },
          { $project: { _id: 0, condition: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ],
        genders: [
          { $group: { _id: "$gender", count: { $sum: 1 } } },
          { $project: { _id: 0, gender: "$_id", count: 1 } },
          { $sort: { count: -1 } },
        ],
        monthly: [
          { $match: { createdAt: { $gte: twelveMonthsAgo } } },
          { $group: { _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } }, count: { $sum: 1 } } },
        ],
        recent: [
          { $sort: { createdAt: -1 } },
          { $limit: 10 },
          { $project: { _id: 1, name: 1, createdAt: 1 } },
        ],
        admissions: [
          { $sort: { createdAt: -1 } },
          { $limit: 6 },
          { $lookup: { from: Doctor.collection.name, localField: "doctorId", foreignField: "_id", as: "doctor" } },
          { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
          { $project: { _id: 1, name: 1, condition: 1, createdAt: 1, doctorName: "$doctor.name" } },
        ],
        daily: [
          { $match: { createdAt: { $gte: dailyStart, $lte: now } } },
          { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "UTC" } }, count: { $sum: 1 } } },
        ],
      } },
    ]),
    Appointment.aggregate([
      { $facet: {
        health: [{ $group: {
          _id: null,
          today: { $sum: { $cond: [{ $eq: ["$date", today] }, 1, 0] } },
          upcoming: { $sum: { $cond: [{ $and: [{ $gt: ["$date", today] }, { $lte: ["$date", nextWeekDate] }, { $in: ["$status", ["scheduled", "confirmed"]] }] }, 1, 0] } },
          recent: { $sum: { $cond: [{ $gte: ["$createdAt", recentStart] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $and: [{ $gte: ["$createdAt", recentStart] }, { $eq: ["$status", "cancelled"] }] }, 1, 0] } },
        } }],
        schedule: [
          { $match: { date: today } },
          { $sort: { time: 1 } },
          { $limit: 8 },
          { $lookup: { from: Patient.collection.name, localField: "patientId", foreignField: "_id", as: "patient" } },
          { $lookup: { from: Doctor.collection.name, localField: "doctorId", foreignField: "_id", as: "doctor" } },
          { $unwind: { path: "$patient", preserveNullAndEmptyArrays: true } },
          { $unwind: { path: "$doctor", preserveNullAndEmptyArrays: true } },
          { $project: { _id: 1, time: 1, room: 1, status: 1, patientName: "$patient.name", doctorName: "$doctor.name" } },
        ],
      } },
    ]),
    Activity.find().sort({ createdAt: -1 }).limit(6).lean(),
  ]);

  const doctors = doctorFacets[0] ?? {};
  const patients = patientFacets[0] ?? {};
  const appointments = appointmentFacets[0] ?? {};
  const doctorStats = doctors.stats?.[0] ?? { total: 0, current: 0, previous: 0 };
  const patientStats = patients.stats?.[0] ?? { total: 0, current: 0, previous: 0, averageAge: 0 };
  const growth = (current: number, previous: number) =>
    previous > 0 ? Math.round(((current - previous) / previous) * 100) : current > 0 ? 100 : 0;

  const doctorMonths = new Map<string, number>((doctors.monthly ?? []).map((item: { _id: { year: number; month: number }; count: number }) => [`${item._id.year}-${item._id.month}`, item.count]));
  const patientMonths = new Map<string, number>((patients.monthly ?? []).map((item: { _id: { year: number; month: number }; count: number }) => [`${item._id.year}-${item._id.month}`, item.count]));
  const monthlyTrend = Array.from({ length: 12 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + index, 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const key = `${year}-${month}`;
    return {
      month: date.toLocaleString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }),
      doctors: doctorMonths.get(key) ?? 0,
      patients: patientMonths.get(key) ?? 0,
    };
  });

  const patientDaily = new Map<string, number>((patients.daily ?? []).map((item: { _id: string; count: number }) => [item._id, item.count]));
  const doctorDaily = new Map<string, number>((doctors.daily ?? []).map((item: { _id: string; count: number }) => [item._id, item.count]));
  const trend30 = Array.from({ length: 30 }, (_, index) => {
    const day = new Date(trendStart);
    day.setUTCDate(day.getUTCDate() + index);
    const key = day.toISOString().slice(0, 10);
    return {
      date: day.toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "UTC" }),
      patients: patientDaily.get(key) ?? 0,
      doctors: doctorDaily.get(key) ?? 0,
    };
  });

  const recentActivity: RecentActivity[] = [
    ...(doctors.recent ?? []).map((doctor: { _id: unknown; name: string; createdAt: Date }) => ({
      _id: String(doctor._id), type: "doctor" as const, name: doctor.name,
      action: "New doctor registered", createdAt: new Date(doctor.createdAt).toISOString(),
    })),
    ...(patients.recent ?? []).map((patient: { _id: unknown; name: string; createdAt: Date }) => ({
      _id: String(patient._id), type: "patient" as const, name: patient.name,
      action: "New patient added", createdAt: new Date(patient.createdAt).toISOString(),
    })),
  ].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 10);

  const recentAdmissions: RecentAdmission[] = (patients.admissions ?? []).map((patient: { _id: unknown; name: string; condition: string; createdAt: Date; doctorName?: string }) => ({
    _id: String(patient._id), patientName: patient.name,
    patientInitials: patient.name.split(/\s+/).map((part: string) => part[0]).join("").toUpperCase().slice(0, 2),
    doctorName: patient.doctorName ? patient.doctorName.replace(/^Dr\.\s*/i, "") : "Doctor record unavailable",
    condition: patient.condition, createdAt: new Date(patient.createdAt).toISOString(),
  }));

  const health = appointments.health?.[0] ?? { today: 0, upcoming: 0, recent: 0, cancelled: 0 };
  const criticalPatients = (patients.conditions ?? []).find((item: { condition: string; count: number }) => /^critical$/i.test(item.condition))?.count ?? 0;
  const previousAdmissionStart = new Date(recentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentAdmissions = (patients.daily ?? []).filter((item: { _id: string }) => item._id >= isoDay(recentStart)).reduce((total: number, item: { count: number }) => total + item.count, 0);
  const previousAdmissions = (patients.daily ?? []).filter((item: { _id: string }) => item._id >= isoDay(previousAdmissionStart) && item._id < isoDay(recentStart)).reduce((total: number, item: { count: number }) => total + item.count, 0);
  const smartInsights: SmartInsightItem[] = [];
  if (criticalPatients > 0) smartInsights.push({
    id: "critical-patients", type: "critical", title: `${criticalPatients} critical patients need attention`,
    subtitle: "Review patient records and follow your clinic's escalation process.", href: "/patients?condition=CRITICAL",
  });
  if (currentAdmissions !== previousAdmissions) {
    const rising = currentAdmissions > previousAdmissions;
    smartInsights.push({
      id: "admission-trend", type: rising ? "warning" : "info",
      title: `${currentAdmissions} patient admissions in the last 7 days`,
      subtitle: `${rising ? "Up" : "Down"} from ${previousAdmissions} in the previous 7 days.`, href: "/patients",
    });
  }

  const recentAppointmentCount = health.recent ?? 0;
  const score = recentAppointmentCount === 0 ? null : Math.max(
    0, 100 - Math.min(60, criticalPatients * 8) - Math.round(((health.cancelled ?? 0) / recentAppointmentCount) * 30)
  );
  const clinicStatus: ClinicHealth["status"] = score === null ? "No data" : score >= 90 ? "Optimal" : score >= 75 ? "Good" : score >= 50 ? "Needs attention" : "Critical";

  return {
    stats: {
      totalDoctors: doctorStats.total,
      totalPatients: patientStats.total,
      averagePatientsPerDoctor: doctorStats.total ? Math.round((patientStats.total / doctorStats.total) * 10) / 10 : 0,
      newDoctorsThisMonth: doctorStats.current,
      newPatientsThisMonth: patientStats.current,
      doctorGrowthPercent: growth(doctorStats.current, doctorStats.previous),
      patientGrowthPercent: growth(patientStats.current, patientStats.previous),
    },
    specializationDistribution: doctors.specializations ?? [],
    patientsPerDoctor: doctors.roster ?? [],
    monthlyTrend,
    recentActivity,
    conditionDistribution: patients.conditions ?? [],
    genderDistribution: patients.genders ?? [],
    averageAge: Math.round((patientStats.averageAge ?? 0) * 10) / 10,
    recentAdmissions,
    admissionTrend7: trend30.slice(-7),
    admissionTrend14: trend30.slice(-14),
    admissionTrend30: trend30,
    clinicHealth: {
      score, status: clinicStatus, criticalPatients,
      appointmentsToday: health.today ?? 0, upcomingThisWeek: health.upcoming ?? 0,
    },
    smartInsights,
    todaySchedule: (appointments.schedule ?? []).filter((item: { patientName?: string; doctorName?: string; room?: string }) => item.patientName && item.doctorName && item.room).map((item: { _id: unknown; time: string; patientName: string; doctorName: string; room: string; status: TodayScheduleItem["status"] }) => ({
      id: String(item._id), time: item.time, patientName: item.patientName,
      doctorName: item.doctorName, room: item.room, status: item.status,
    })),
    liveActivities: activityRows.map((activity) => ({
      id: String(activity._id), type: activity.type as LiveActivityItem["type"],
      userName: activity.userName, description: activity.description,
      timeAgo: formatRelativeTime(activity.createdAt), createdAt: activity.createdAt.toISOString(),
    })),
  };
}
