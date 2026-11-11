export const APP_NAME = "Doctor Tracker";
export const APP_DESCRIPTION = "Secure administrative web application for managing doctors and patients";

export const ITEMS_PER_PAGE = 10;
export const SEARCH_DEBOUNCE_MS = 300;

export const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "General Practice",
  "Hematology",
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

export const PATIENT_CONDITIONS = [
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

