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
  specialization: string;
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

export interface ConditionDistribution {
  condition: string;
  count: number;
}

export interface GenderDistribution {
  gender: string;
  count: number;
}

export interface RecentAdmission {
  _id: string;
  patientName: string;
  patientInitials: string;
  doctorName: string;
  condition: string;
  createdAt: string;
}

export interface AdmissionTrend {
  date: string;
  patients: number;
  doctors: number;
}

export interface DashboardData {
  stats: DashboardStats;
  specializationDistribution: SpecializationDistribution[];
  patientsPerDoctor: PatientsPerDoctor[];
  monthlyTrend: MonthlyTrend[];
  recentActivity: RecentActivity[];
  conditionDistribution: ConditionDistribution[];
  genderDistribution: GenderDistribution[];
  averageAge: number;
  recentAdmissions: RecentAdmission[];
  admissionTrend7: AdmissionTrend[];
  admissionTrend14: AdmissionTrend[];
  admissionTrend30: AdmissionTrend[];
}
