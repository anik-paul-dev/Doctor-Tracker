import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
import Appointment from "@/models/Appointment";
import Activity from "@/models/Activity";
import { formatRelativeTime } from "@/lib/utils";
import type {
  DashboardStats,
  SpecializationDistribution,
  PatientsPerDoctor,
  MonthlyTrend,
  RecentActivity,
  ConditionDistribution,
  GenderDistribution,
  RecentAdmission,
  AdmissionTrend,
  ClinicHealth,
  SmartInsightItem,
  TodayScheduleItem,
  LiveActivityItem,
} from "@/types/dashboard";

export async function getDashboardStats(): Promise<DashboardStats> {
  await connectDB();

  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalDoctors,
    totalPatients,
    newDoctorsThisMonth,
    newPatientsThisMonth,
    doctorsLastMonth,
    patientsLastMonth,
  ] = await Promise.all([
    Doctor.countDocuments(),
    Patient.countDocuments(),
    Doctor.countDocuments({ createdAt: { $gte: firstDayThisMonth } }),
    Patient.countDocuments({ createdAt: { $gte: firstDayThisMonth } }),
    Doctor.countDocuments({
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth },
    }),
    Patient.countDocuments({
      createdAt: { $gte: firstDayLastMonth, $lt: firstDayThisMonth },
    }),
  ]);

  const averagePatientsPerDoctor =
    totalDoctors > 0
      ? Math.round((totalPatients / totalDoctors) * 10) / 10
      : 0;

  const doctorGrowthPercent =
    doctorsLastMonth > 0
      ? Math.round(
          ((newDoctorsThisMonth - doctorsLastMonth) / doctorsLastMonth) * 100
        )
      : newDoctorsThisMonth > 0
        ? 100
        : 0;

  const patientGrowthPercent =
    patientsLastMonth > 0
      ? Math.round(
          ((newPatientsThisMonth - patientsLastMonth) / patientsLastMonth) * 100
        )
      : newPatientsThisMonth > 0
        ? 100
        : 0;

  return {
    totalDoctors,
    totalPatients,
    averagePatientsPerDoctor,
    newDoctorsThisMonth,
    newPatientsThisMonth,
    doctorGrowthPercent,
    patientGrowthPercent,
  };
}

export async function getSpecializationDistribution(): Promise<
  SpecializationDistribution[]
> {
  await connectDB();

  const result = await Doctor.aggregate([
    {
      $group: {
        _id: "$specialization",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        specialization: "$_id",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return result;
}

export async function getPatientsPerDoctor(): Promise<PatientsPerDoctor[]> {
  await connectDB();

  const result = await Doctor.find()
    .sort({ patientCount: -1 })
    .limit(10)
    .select("name patientCount specialization")
    .lean();

  return result.map((doc) => ({
    doctorName: doc.name,
    patientCount: doc.patientCount,
    specialization: doc.specialization || "",
  }));
}

export async function getMonthlyTrend(): Promise<MonthlyTrend[]> {
  await connectDB();

  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [doctorTrend, patientTrend] = await Promise.all([
    Doctor.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Patient.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  // Build a map for all 12 months
  const months: MonthlyTrend[] = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const monthLabel = date.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const doctorEntry = doctorTrend.find(
      (d: { _id: { year: number; month: number }; count: number }) =>
        d._id.year === year && d._id.month === month
    );
    const patientEntry = patientTrend.find(
      (p: { _id: { year: number; month: number }; count: number }) =>
        p._id.year === year && p._id.month === month
    );

    months.push({
      month: monthLabel,
      doctors: doctorEntry?.count ?? 0,
      patients: patientEntry?.count ?? 0,
    });
  }

  return months;
}

export async function getRecentActivity(): Promise<RecentActivity[]> {
  await connectDB();

  const [recentDoctors, recentPatients] = await Promise.all([
    Doctor.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name createdAt")
      .lean()
      .exec() as unknown as Promise<Array<{ _id: unknown; name: string; createdAt: Date }>>,
    Patient.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("name createdAt")
      .lean()
      .exec() as unknown as Promise<Array<{ _id: unknown; name: string; createdAt: Date }>>,
  ]);

  const activities: RecentActivity[] = [
    ...recentDoctors.map((doc) => ({
      _id: String(doc._id),
      type: "doctor" as const,
      name: doc.name,
      action: "New doctor registered",
      createdAt: doc.createdAt.toISOString(),
    })),
    ...recentPatients.map((patient) => ({
      _id: String(patient._id),
      type: "patient" as const,
      name: patient.name,
      action: "New patient added",
      createdAt: patient.createdAt.toISOString(),
    })),
  ];

  // Sort combined by createdAt desc and take top 10
  activities.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return activities.slice(0, 10);
}

export async function getConditionDistribution(): Promise<ConditionDistribution[]> {
  await connectDB();

  const result = await Patient.aggregate([
    {
      $group: {
        _id: "$condition",
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        condition: "$_id",
        count: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  return result;
}

export async function getGenderDistribution(): Promise<{
  distribution: GenderDistribution[];
  averageAge: number;
}> {
  await connectDB();

  const [genderResult, ageResult] = await Promise.all([
    Patient.aggregate([
      {
        $group: {
          _id: "$gender",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          gender: "$_id",
          count: 1,
        },
      },
      { $sort: { count: -1 } },
    ]),
    Patient.aggregate([
      {
        $group: {
          _id: null,
          averageAge: { $avg: "$age" },
        },
      },
    ]),
  ]);

  const averageAge =
    ageResult.length > 0 ? Math.round(ageResult[0].averageAge * 10) / 10 : 0;

  return { distribution: genderResult, averageAge };
}

export async function getAdmissionTrends(): Promise<Record<7 | 14 | 30, AdmissionTrend[]>> {
  await connectDB();
  const endDate = new Date();
  endDate.setUTCHours(23, 59, 59, 999);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 29);
  startDate.setUTCHours(0, 0, 0, 0);

  const [patientTrend, doctorTrend] = await Promise.all([
    Patient.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Doctor.aggregate([
      { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const dayMap = new Map<string, { patients: number; doctors: number }>();
  for (let i = 0; i < 30; i++) {
    const day = new Date(startDate);
    day.setUTCDate(day.getUTCDate() + i);
    dayMap.set(day.toISOString().slice(0, 10), { patients: 0, doctors: 0 });
  }
  for (const entry of patientTrend) {
    const bucket = dayMap.get(entry._id);
    if (bucket) bucket.patients = entry.count;
  }
  for (const entry of doctorTrend) {
    const bucket = dayMap.get(entry._id);
    if (bucket) bucket.doctors = entry.count;
  }

  const result = Array.from(dayMap.entries()).map(([dateStr, counts]) => ({
    date: new Date(`${dateStr}T00:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "2-digit", timeZone: "UTC" }),
    ...counts,
  }));
  return { 7: result.slice(-7), 14: result.slice(-14), 30: result };
}

export async function getRecentAdmissions(
  limit: number = 6
): Promise<RecentAdmission[]> {
  await connectDB();

  const patients = (await Patient.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("doctorId", "name")
    .lean()
    .exec()) as unknown as Array<{
    _id: unknown;
    name: string;
    condition: string;
    createdAt: Date;
    doctorId: { name: string } | null;
  }>;

  return patients.map((p) => ({
    _id: String(p._id),
    patientName: p.name,
    patientInitials: p.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2),
    doctorName: p.doctorId?.name ? p.doctorId.name.replace(/^Dr\.\s*/i, "") : "Doctor record unavailable",
    condition: p.condition,
    createdAt: p.createdAt.toISOString(),
  }));
}

export async function getClinicHealth(): Promise<ClinicHealth> {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().slice(0, 10);

  const recentStart = new Date();
  recentStart.setDate(recentStart.getDate() - 7);
  const [criticalCount, todayAppts, upcomingAppts, recentAppointments, cancelledAppointments] = await Promise.all([
    Patient.countDocuments({ condition: { $regex: /^critical$/i } }),
    Appointment.countDocuments({ date: today }),
    Appointment.countDocuments({ date: { $gt: today, $lte: nextWeekStr }, status: { $nin: ["cancelled", "completed"] } }),
    Appointment.countDocuments({ createdAt: { $gte: recentStart } }),
    Appointment.countDocuments({ createdAt: { $gte: recentStart }, status: "cancelled" }),
  ]);

  const score = recentAppointments === 0
    ? null
    : Math.max(
        0,
        100 - Math.min(60, criticalCount * 8) - Math.round((cancelledAppointments / recentAppointments) * 30)
      );
  const status: ClinicHealth["status"] = score === null
    ? "No data"
    : score >= 90
      ? "Optimal"
      : score >= 75
        ? "Good"
        : score >= 50
          ? "Needs attention"
          : "Critical";

  return {
    score,
    status,
    criticalPatients: criticalCount,
    appointmentsToday: todayAppts,
    upcomingThisWeek: upcomingAppts,
  };
}

export async function getSmartInsights(): Promise<SmartInsightItem[]> {
  await connectDB();
  const now = new Date();
  const currentPeriodStart = new Date(now);
  currentPeriodStart.setDate(currentPeriodStart.getDate() - 7);
  const previousPeriodStart = new Date(currentPeriodStart);
  previousPeriodStart.setDate(previousPeriodStart.getDate() - 7);
  const [criticalCount, currentAdmissions, previousAdmissions] = await Promise.all([
    Patient.countDocuments({ condition: { $regex: /^critical$/i } }),
    Patient.countDocuments({ createdAt: { $gte: currentPeriodStart } }),
    Patient.countDocuments({ createdAt: { $gte: previousPeriodStart, $lt: currentPeriodStart } }),
  ]);

  const insights: SmartInsightItem[] = [];
  if (criticalCount > 0) {
    insights.push({
      id: "critical-patients",
      type: "critical",
      title: `${criticalCount} critical patients need attention`,
      subtitle: "Review patient records and follow your clinic's escalation process.",
      href: "/patients?condition=CRITICAL",
    });
  }
  if (currentAdmissions !== previousAdmissions) {
    const rising = currentAdmissions > previousAdmissions;
    insights.push({
      id: "admission-trend",
      type: rising ? "warning" : "info",
      title: `${currentAdmissions} patient admissions in the last 7 days`,
      subtitle: `${rising ? "Up" : "Down"} from ${previousAdmissions} in the previous 7 days.`,
      href: "/patients",
    });
  }
  return insights;
}

export async function getTodaySchedule(): Promise<TodayScheduleItem[]> {
  await connectDB();
  const today = new Date().toISOString().slice(0, 10);
  const appts = await Appointment.find({ date: today })
    .populate("patientId", "name")
    .populate("doctorId", "name")
    .sort({ time: 1 })
    .limit(8)
    .lean();

  return appts.map((a) => {
      const p = a.patientId as { name?: string } | null;
      const d = a.doctorId as { name?: string } | null;
      if (!p?.name || !d?.name || !a.room) return null;
      return {
        id: String(a._id),
        time: a.time,
        patientName: p.name,
        doctorName: d.name,
        room: a.room,
        status: (a.status as TodayScheduleItem["status"]) || "completed",
      };
  }).filter((item): item is TodayScheduleItem => item !== null);
}

export async function getLiveActivities(): Promise<LiveActivityItem[]> {
  await connectDB();
  const activities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();

  return activities.map((act) => ({
      id: String(act._id),
      type: act.type as LiveActivityItem["type"],
      userName: act.userName,
      description: act.description,
      timeAgo: formatRelativeTime(act.createdAt),
      createdAt: act.createdAt.toISOString(),
  }));
}
