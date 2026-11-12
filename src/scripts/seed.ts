import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";
import User from "../models/User";
import Doctor from "../models/Doctor";
import Patient from "../models/Patient";
import Appointment from "../models/Appointment";
import Activity from "../models/Activity";

// Load local environment variables without adding a runtime dependency.
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env.local");
  process.exitCode = 1;
}

const DOCTOR_FIXTURES = [
  ["Dr. Farhana Karim", "Cardiology", "Evercare Hospital Dhaka", "13"],
  ["Dr. Mahmudul Hasan", "Internal Medicine", "Dhaka Medical College Hospital", "14"],
  ["Dr. Nusrat Jahan", "Gynecology", "Square Hospital", "15"],
  ["Dr. Tanvir Ahmed", "Neurology", "Bangladesh Medical University Hospital", "16"],
  ["Dr. Samia Rahman", "Pediatrics", "Bangladesh Shishu Hospital & Institute", "17"],
  ["Dr. Arif Chowdhury", "Orthopedics", "Labaid Specialized Hospital", "18"],
  ["Dr. Tanjim Sultana", "Dermatology", "Popular Diagnostic Centre", "19"],
  ["Dr. Rashed Kabir", "General Surgery", "Chattogram Medical College Hospital", "13"],
  ["Dr. Sharmin Akter", "Psychiatry", "National Institute of Mental Health", "14"],
  ["Dr. Imran Hossain", "Radiology", "Rajshahi Medical College Hospital", "15"],
  ["Dr. Mehnaz Islam", "Ophthalmology", "Bangladesh Eye Hospital", "16"],
  ["Dr. Zubair Ahmed", "ENT", "Sylhet MAG Osmani Medical College Hospital", "17"],
] as const;

const FIRST_NAMES = [
  "Ayesha", "Nusrat", "Farhana", "Samira", "Tasnim", "Mehedi", "Tanvir", "Sabbir",
  "Nabil", "Rafi", "Arif", "Mahmud", "Sumaiya", "Jannat", "Maliha", "Sadia",
  "Rakib", "Fahim", "Imran", "Shakib", "Nafisa", "Tanjim", "Mim", "Rumana",
];
const LAST_NAMES = [
  "Rahman", "Hossain", "Akter", "Ahmed", "Chowdhury", "Islam", "Khan", "Uddin",
  "Sultana", "Karim", "Hasan", "Begum", "Alam", "Das", "Kabir", "Sarker",
  "Mia", "Jahan", "Mahmud", "Roy",
];
const DISTRICTS = [
  ["Dhanmondi", "Dhaka"], ["Mirpur", "Dhaka"], ["Uttara", "Dhaka"],
  ["Agrabad", "Chattogram"], ["Panchlaish", "Chattogram"], ["Boalia", "Rajshahi"],
  ["Zindabazar", "Sylhet"], ["Sonadanga", "Khulna"], ["Barishal Sadar", "Barishal"],
  ["Sadar", "Rangpur"], ["Sadar", "Cumilla"], ["Sadar", "Mymensingh"],
] as const;
const CONDITIONS = [
  "Critical", "Serious", "Stable", "Stable", "Stable", "Recovering", "Recovering", "Discharged",
] as const;
const MOBILE_PREFIXES = ["13", "14", "15", "16", "17", "18", "19"];
const APPOINTMENT_REASONS = [
  "Follow-up consultation", "Blood pressure review", "Diabetes management",
  "Prenatal check-up", "Post-operative review", "Respiratory assessment",
  "Cardiac follow-up", "Routine health check",
];
const APPOINTMENT_STATUSES = ["scheduled", "confirmed", "completed", "cancelled"] as const;
const APPOINTMENT_TIMES = [
  "09:00 AM", "09:45 AM", "10:30 AM", "11:15 AM", "12:00 PM", "01:00 PM",
  "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM",
];
const dayMs = 24 * 60 * 60 * 1000;

function isoDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

async function seed() {
  if (!MONGODB_URI) return;

  try {
    await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5_000,
      connectTimeoutMS: 5_000,
    });

    const adminEmail = "admin@doctortracker.com";
    const existingAdmin = await User.findOne({ email: adminEmail }).select("_id").lean();
    if (!existingAdmin) {
      await User.create({
        name: "Doctor Tracker Demo Admin",
        email: adminEmail,
        password: await bcrypt.hash("password123", 12),
        role: "admin",
      });
      console.log("Created the documented demo administrator for an empty database.");
    }

    const now = new Date();
    const doctorFixtures = DOCTOR_FIXTURES.map(([name, specialization, hospital, prefix], index) => ({
      seedKey: `bd-doctor-${String(index + 1).padStart(3, "0")}`,
      name,
      specialization,
      hospital,
      phone: `+880${prefix}${String(90000000 + index).slice(-8)}`,
      email: `bd-doctor-${String(index + 1).padStart(2, "0")}@seed.doctortracker.local`,
      patientCount: 0,
      createdAt: new Date(now.getTime() - ((index * 23) % 330) * dayMs),
      updatedAt: now,
    }));

    await Doctor.bulkWrite(
      doctorFixtures.map((doctor) => ({
        updateOne: {
          filter: { seedKey: doctor.seedKey },
          update: { $setOnInsert: doctor },
          upsert: true,
        },
      })),
      { ordered: false, timestamps: false }
    );
    const doctorEmails = doctorFixtures.map((doctor) => doctor.email);
    const doctors = await Doctor.find({ email: { $in: doctorEmails } })
      .select("_id name email")
      .lean();
    const doctorsByEmail = new Map(doctors.map((doctor) => [doctor.email, doctor]));
    const seededDoctors = doctorFixtures.flatMap((doctor) => {
      const match = doctorsByEmail.get(doctor.email);
      return match ? [match] : [];
    });
    if (seededDoctors.length !== doctorFixtures.length) {
      throw new Error("Unable to load all Bangladesh doctor fixtures after upsert");
    }

    const patientCount = 36;
    const patientFixtures = Array.from({ length: patientCount }, (_, index) => {
      const first = FIRST_NAMES[index % FIRST_NAMES.length];
      const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
      const [area, district] = DISTRICTS[index % DISTRICTS.length];
      const doctor = seededDoctors[index % seededDoctors.length]!;
      const patientNo = String(index + 1).padStart(3, "0");
      const createdAt = new Date(now.getTime() - ((index * 7) % 365) * dayMs);
      return {
        seedKey: `bd-patient-${patientNo}`,
        doctorId: doctor._id,
        name: `${first} ${last}`,
        age: 4 + ((index * 11) % 83),
        gender: (["female", "male", "other"] as const)[index % 3],
        condition: CONDITIONS[index % CONDITIONS.length],
        phone: `+880${MOBILE_PREFIXES[index % MOBILE_PREFIXES.length]}${String(10000000 + index).slice(-8)}`,
        email: `bd-patient-${patientNo}@seed.doctortracker.local`,
        address: `House ${10 + (index % 90)}, ${area}, ${district}, Bangladesh`,
        notes: "Synthetic Bangladesh demo record for application testing; not a real patient or medical record.",
        createdAt,
        updatedAt: createdAt,
      };
    });

    await Patient.bulkWrite(
      patientFixtures.map((patient) => ({
        updateOne: {
          filter: { seedKey: patient.seedKey },
          update: { $setOnInsert: patient },
          upsert: true,
        },
      })),
      { ordered: false, timestamps: false }
    );
    const patientEmails = patientFixtures.map((patient) => patient.email);
    const patients = await Patient.find({ email: { $in: patientEmails } })
      .select("_id name email doctorId")
      .lean();
    const patientsByEmail = new Map(patients.map((patient) => [patient.email, patient]));
    const seededPatients = patientFixtures.map((patient) => patientsByEmail.get(patient.email)).filter(Boolean);
    if (seededPatients.length !== patientCount) {
      throw new Error("Unable to load all Bangladesh patient fixtures after upsert");
    }

    const patientCounts = await Patient.aggregate([
      { $match: { doctorId: { $in: seededDoctors.map((doctor) => doctor._id) } } },
      { $group: { _id: "$doctorId", count: { $sum: 1 } } },
    ]);
    const countByDoctor = new Map(patientCounts.map((item) => [String(item._id), item.count]));
    await Doctor.bulkWrite(
      seededDoctors.map((doctor) => ({
        updateOne: {
          filter: { _id: doctor._id },
          update: { $set: { patientCount: countByDoctor.get(String(doctor._id)) ?? 0 } },
        },
      }))
    );

    const today = new Date();
    const appointmentFixtures = seededPatients.flatMap((patient, index) => {
      const patientNo = String(index + 1).padStart(3, "0");
      const doctorId = patient!.doctorId;
      const firstOffset = index < 12 ? 0 : (index % 61) - 30;
      const secondOffset = -30 + ((index * 13) % 360);
      return [firstOffset, secondOffset].map((offset, visitIndex) => {
        const visitDate = new Date(today.getTime() + offset * dayMs);
        const createdAt = new Date(now.getTime() - (index % 30) * dayMs);
        return {
          seedKey: `bd-appointment-${patientNo}-${visitIndex + 1}`,
          patientId: patient!._id,
          doctorId,
          date: isoDay(visitDate),
          time: APPOINTMENT_TIMES[(index + visitIndex) % APPOINTMENT_TIMES.length],
          duration: 30 + ((index + visitIndex) % 3) * 15,
          reason: APPOINTMENT_REASONS[(index + visitIndex) % APPOINTMENT_REASONS.length],
          room: `Room ${201 + ((index * 7 + visitIndex) % 80)}`,
          status: (index < 12 && visitIndex === 0
            ? index % 2 === 0 ? "confirmed" : "scheduled"
            : APPOINTMENT_STATUSES[(index + visitIndex) % APPOINTMENT_STATUSES.length]),
          notes: "Synthetic Bangladesh demo appointment for application testing.",
          createdAt,
          updatedAt: createdAt,
        };
      });
    });

    await Appointment.bulkWrite(
      appointmentFixtures.map((appointment) => ({
        updateOne: {
          filter: { seedKey: appointment.seedKey },
          update: { $setOnInsert: appointment },
          upsert: true,
        },
      })),
      { ordered: false, timestamps: false }
    );

    const activityFixtures = [
      ...seededDoctors.slice(0, 12).map((doctor, index) => ({
        seedKey: `bd-import-doctor-${String(index + 1).padStart(3, "0")}`,
        type: "Created" as const,
        userName: "Bangladesh demo data import",
        description: `Imported demo doctor record for ${doctor!.name}`,
        entityType: "doctor" as const,
      })),
      ...seededPatients.map((patient, index) => ({
        seedKey: `bd-import-patient-${String(index + 1).padStart(3, "0")}`,
        type: "Created" as const,
        userName: "Bangladesh demo data import",
        description: `Imported demo patient record for ${patient!.name}`,
        entityType: "patient" as const,
      })),
    ];
    await Activity.bulkWrite(
      activityFixtures.map((activity, index) => ({
        updateOne: {
          filter: { seedKey: activity.seedKey },
          update: {
            $setOnInsert: {
              ...activity,
              createdAt: new Date(now.getTime() - index * 60 * 60 * 1000),
            },
          },
          upsert: true,
        },
      })),
      { ordered: false, timestamps: false }
    );

    const [doctorTotal, patientTotal, appointmentTotal, activityTotal] = await Promise.all([
      Doctor.countDocuments({ seedKey: { $regex: /^bd-doctor-/ } }),
      Patient.countDocuments({ seedKey: { $regex: /^bd-patient-/ } }),
      Appointment.countDocuments({ seedKey: { $regex: /^bd-appointment-/ } }),
      Activity.countDocuments({ seedKey: { $regex: /^bd-import-/ } }),
    ]);
    console.log("Bangladesh demo records are ready (existing records were preserved).");
    console.log(`Database seed totals — doctors: ${doctorTotal}, patients: ${patientTotal}, appointments: ${appointmentTotal}, activities: ${activityTotal}`);
  } catch (error) {
    console.error("Failed to seed Bangladesh demo records:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

void seed();
