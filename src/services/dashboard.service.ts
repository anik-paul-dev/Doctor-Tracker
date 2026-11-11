import connectDB from "@/lib/db";
import Doctor from "@/models/Doctor";
import Patient from "@/models/Patient";
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
    specialization: doc.specialization || "General",
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

export async function getAdmissionTrend(days: number): Promise<AdmissionTrend[]> {
  await connectDB();

  // Find the latest activity date to anchor realistic window for demo / seeded databases
  const latestPatient = (await Patient.findOne()
    .sort({ createdAt: -1 })
    .select("createdAt")
    .lean()) as { createdAt?: Date } | null;

  const now = new Date();
  const latestDate = latestPatient?.createdAt ? new Date(latestPatient.createdAt) : now;

  // Use the latest date if recent records are from past days (e.g., seeded data)
  // but if real records were created today or recently, anchor to now
  const anchorDate =
    now.getTime() - latestDate.getTime() > days * 24 * 60 * 60 * 1000
      ? new Date(latestDate)
      : now;

  const startDate = new Date(anchorDate);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  const [patientTrend, doctorTrend] = await Promise.all([
    Patient.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Doctor.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Build map of all days in range
  const dayMap = new Map<string, { patients: number; doctors: number }>();
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dayMap.set(key, { patients: 0, doctors: 0 });
  }

  for (const entry of patientTrend) {
    const existing = dayMap.get(entry._id);
    if (existing) existing.patients = entry.count;
  }
  for (const entry of doctorTrend) {
    const existing = dayMap.get(entry._id);
    if (existing) existing.doctors = entry.count;
  }

  const result: AdmissionTrend[] = Array.from(dayMap.entries()).map(
    ([dateStr, counts]) => {
      const d = new Date(dateStr + "T00:00:00");
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
      });
      return { date: label, patients: counts.patients, doctors: counts.doctors };
    }
  );

  return result;
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
    doctorName: p.doctorId?.name ? p.doctorId.name.replace(/^Dr\.\s*/i, "") : "Unknown",
    condition: p.condition,
    createdAt: p.createdAt.toISOString(),
  }));
}
