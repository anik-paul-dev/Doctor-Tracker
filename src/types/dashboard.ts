export interface DashboardStats {
  totalDoctors: number;
  totalPatients: number;
  averagePatientsPerDoctor: number;
  newDoctorsThisMonth: number;
  newPatientsThisMonth: number;
  doctorGrowthPercent: number;
  patientGrowthPercent: number;
}

export interface SpecializationDistribution {
  specialization: string;
  count: number;
}

export interface PatientsPerDoctor {
  doctorName: string;
  patientCount: number;
}

export interface MonthlyTrend {
  month: string;
  doctors: number;
  patients: number;
}

export interface RecentActivity {
  _id: string;
  type: "doctor" | "patient";
  name: string;
  action: string;
  createdAt: string;
}

export interface DashboardData {
  stats: DashboardStats;
  specializationDistribution: SpecializationDistribution[];
  patientsPerDoctor: PatientsPerDoctor[];
  monthlyTrend: MonthlyTrend[];
  recentActivity: RecentActivity[];
}

