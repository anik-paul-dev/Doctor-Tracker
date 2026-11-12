export const APP_NAME = "Doctor Tracker";
export const APP_DESCRIPTION = "Secure administrative web application for managing doctors and patients";

export const ITEMS_PER_PAGE = 10;
export const SEARCH_DEBOUNCE_MS = 300;

export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "ENT",
  "Gastroenterology",
  "General Practice",
  "General Surgery",
  "Gynecology",
  "Hematology",
  "Internal Medicine",
  "Nephrology",
  "Neurology",
  "Oncology",
  "Ophthalmology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Pulmonology",
  "Radiology",
  "Rheumatology",
  "Surgery",
  "Urology",
] as const;

export const SPECIALIZATION_STYLES: Record<string, string> = {
  ENT: "bg-purple-950/70 text-purple-300 border-purple-800/80",
  Gynecology: "bg-amber-950/70 text-amber-300 border-amber-800/80",
  Radiology: "bg-cyan-950/70 text-cyan-300 border-cyan-800/80",
  Ophthalmology: "bg-orange-950/70 text-orange-300 border-orange-800/80",
  "Internal Medicine": "bg-amber-900/60 text-amber-200 border-amber-700/80",
  Pediatrics: "bg-pink-950/70 text-pink-300 border-pink-800/80",
  Orthopedics: "bg-yellow-950/70 text-yellow-300 border-yellow-800/80",
  "General Surgery": "bg-orange-950/70 text-orange-300 border-orange-800/80",
  Surgery: "bg-orange-950/70 text-orange-300 border-orange-800/80",
  Cardiology: "bg-rose-950/70 text-rose-300 border-rose-800/80",
  Dermatology: "bg-emerald-950/70 text-emerald-300 border-emerald-800/80",
  Neurology: "bg-indigo-950/70 text-indigo-300 border-indigo-800/80",
  Psychiatry: "bg-blue-950/70 text-blue-300 border-blue-800/80",
  Oncology: "bg-fuchsia-950/70 text-fuchsia-300 border-fuchsia-800/80",
  Urology: "bg-teal-950/70 text-teal-300 border-teal-800/80",
  Endocrinology: "bg-violet-950/70 text-violet-300 border-violet-800/80",
  Gastroenterology: "bg-lime-950/70 text-lime-300 border-lime-800/80",
  Nephrology: "bg-sky-950/70 text-sky-300 border-sky-800/80",
  Pulmonology: "bg-teal-950/70 text-teal-300 border-teal-800/80",
  Rheumatology: "bg-amber-950/70 text-amber-300 border-amber-800/80",
  "General Practice": "bg-slate-900/70 text-slate-300 border-slate-700/80",
};

export const PATIENT_CONDITIONS = [
  "Critical",
  "Serious",
  "Stable",
  "Recovering",
  "Discharged",
  "Diabetes",
  "Hypertension",
  "Asthma",
  "Heart Disease",
  "Arthritis",
  "Cancer",
  "Chronic Pain",
  "Depression",
  "Anxiety",
  "Migraine",
  "Obesity",
  "Thyroid Disorder",
  "Kidney Disease",
  "Liver Disease",
  "Stroke",
  "Allergy",
  "Infection",
  "Fracture",
  "Other",
] as const;

export const GENDERS = ["male", "female", "other"] as const;

export const NAV_ITEMS = [
  {
    title: "Dashboard",
    href: "/",
    icon: "LayoutDashboard",
  },
  {
    title: "Doctors",
    href: "/doctors",
    icon: "Stethoscope",
  },
  {
    title: "Patients",
    href: "/patients",
    icon: "Users",
  },
] as const;

