import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  content.split("\n").forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env.local");
  process.exit(1);
}

// User Schema & Model
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "admin" },
  },
  { timestamps: true }
);

// Doctor Schema & Model
const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    hospital: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    patientCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Patient Schema & Model
const patientSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, enum: ["male", "female", "other"], required: true },
    condition: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);
const Patient = mongoose.models.Patient || mongoose.model("Patient", patientSchema);

const DOCTORS_DATA = [
  {
    name: "Dr. Gregory House",
    specialization: "Nephrology",
    hospital: "Princeton-Plainsboro Teaching Hospital",
    phone: "+1 (555) 101-2001",
    email: "g.house@princeton-med.org",
  },
  {
    name: "Dr. Meredith Grey",
    specialization: "Surgery",
    hospital: "Grey Sloan Memorial Hospital",
    phone: "+1 (555) 101-2002",
    email: "m.grey@greysloan.org",
  },
  {
    name: "Dr. James Wilson",
    specialization: "Oncology",
    hospital: "Princeton-Plainsboro Teaching Hospital",
    phone: "+1 (555) 101-2003",
    email: "j.wilson@princeton-med.org",
  },
  {
    name: "Dr. Cristina Yang",
    specialization: "Cardiology",
    hospital: "Klausman Institute for Cardiac Research",
    phone: "+1 (555) 101-2004",
    email: "c.yang@klausman-cardiac.ch",
  },
  {
    name: "Dr. Derek Shepherd",
    specialization: "Neurology",
    hospital: "Grey Sloan Memorial Hospital",
    phone: "+1 (555) 101-2005",
    email: "d.shepherd@greysloan.org",
  },
  {
    name: "Dr. Robert Chase",
    specialization: "Surgery",
    hospital: "Mayo Clinic - Rochester",
    phone: "+1 (555) 101-2006",
    email: "r.chase@mayo.edu",
  },
  {
    name: "Dr. Allison Cameron",
    specialization: "Allergy",
    hospital: "Cleveland Clinic",
    phone: "+1 (555) 101-2007",
    email: "a.cameron@ccf.org",
  },
  {
    name: "Dr. Eric Foreman",
    specialization: "Neurology",
    hospital: "Johns Hopkins Hospital",
    phone: "+1 (555) 101-2008",
    email: "e.foreman@jhmi.edu",
  },
  {
    name: "Dr. Lisa Cuddy",
    specialization: "Endocrinology",
    hospital: "Princeton-Plainsboro Teaching Hospital",
    phone: "+1 (555) 101-2009",
    email: "l.cuddy@princeton-med.org",
  },
  {
    name: "Dr. Miranda Bailey",
    specialization: "Surgery",
    hospital: "Grey Sloan Memorial Hospital",
    phone: "+1 (555) 101-2010",
    email: "m.bailey@greysloan.org",
  },
  {
    name: "Dr. Shaun Murphy",
    specialization: "Pediatrics",
    hospital: "San Jose St. Bonaventure Hospital",
    phone: "+1 (555) 101-2011",
    email: "s.murphy@stbonaventure.org",
  },
  {
    name: "Dr. Claire Browne",
    specialization: "Cardiology",
    hospital: "San Jose St. Bonaventure Hospital",
    phone: "+1 (555) 101-2012",
    email: "c.browne@stbonaventure.org",
  },
  {
    name: "Dr. Neil Melendez",
    specialization: "Cardiology",
    hospital: "Massachusetts General Hospital",
    phone: "+1 (555) 101-2013",
    email: "n.melendez@mgh.harvard.edu",
  },
  {
    name: "Dr. Aaron Glassman",
    specialization: "Neurology",
    hospital: "San Jose St. Bonaventure Hospital",
    phone: "+1 (555) 101-2014",
    email: "a.glassman@stbonaventure.org",
  },
  {
    name: "Dr. John Watson",
    specialization: "General Practice",
    hospital: "St. Thomas' Hospital",
    phone: "+1 (555) 101-2015",
    email: "j.watson@gstt.nhs.uk",
  },
  {
    name: "Dr. Anthony Fauci",
    specialization: "Allergy",
    hospital: "National Institutes of Health Clinical Center",
    phone: "+1 (555) 101-2016",
    email: "a.fauci@nih.gov",
  },
  {
    name: "Dr. Sanjay Gupta",
    specialization: "Neurology",
    hospital: "Emory University Hospital",
    phone: "+1 (555) 101-2017",
    email: "s.gupta@emoryhealthcare.org",
  },
  {
    name: "Dr. Paul Farmer",
    specialization: "Infection",
    hospital: "Brigham and Women's Hospital",
    phone: "+1 (555) 101-2018",
    email: "p.farmer@bwh.harvard.edu",
  },
  {
    name: "Dr. Helen Sharpe",
    specialization: "Oncology",
    hospital: "New Amsterdam Medical Center",
    phone: "+1 (555) 101-2019",
    email: "h.sharpe@newamsterdam.org",
  },
  {
    name: "Dr. Max Goodwin",
    specialization: "General Practice",
    hospital: "New Amsterdam Medical Center",
    phone: "+1 (555) 101-2020",
    email: "m.goodwin@newamsterdam.org",
  },
];

const PATIENTS_POOL = [
  { name: "Arthur Dent", age: 42, gender: "male", condition: "Anxiety", phone: "+1 (555) 901-3001", notes: "Panic attacks regarding intergalactic construction." },
  { name: "Ford Prefect", age: 39, gender: "male", condition: "Chronic Pain", phone: "+1 (555) 901-3002", notes: "Recurring lower back strain." },
  { name: "Trillian Astra", age: 32, gender: "female", condition: "Asthma", phone: "+1 (555) 901-3003", notes: "Mild exercise-induced bronchospasm." },
  { name: "Tricia McMillan", age: 29, gender: "female", condition: "Migraine", phone: "+1 (555) 901-3004", notes: "Visual aura preceding acute headaches." },
  { name: "Marvin Paranoid", age: 50, gender: "other", condition: "Depression", phone: "+1 (555) 901-3005", notes: "Persistent melancholia and joint stiffness." },
  { name: "Zaphod Beeblebrox", age: 45, gender: "male", condition: "Hypertension", phone: "+1 (555) 901-3006", notes: "Elevated systolic pressure; high stress lifestyle." },
  { name: "Sarah Connor", age: 58, gender: "female", condition: "Fracture", phone: "+1 (555) 901-3007", notes: "Compound radius fracture recovering post-surgery." },
  { name: "John Connor", age: 26, gender: "male", condition: "Allergy", phone: "+1 (555) 901-3008", notes: "Severe seasonal rhinitis and dust sensitivity." },
  { name: "Kyle Reese", age: 31, gender: "male", condition: "Heart Disease", phone: "+1 (555) 901-3009", notes: "Early onset coronary atherosclerosis under observation." },
  { name: "Ellen Ripley", age: 48, gender: "female", condition: "Asthma", phone: "+1 (555) 901-3010", notes: "Requires daily corticosteroid inhaler." },
  { name: "Luke Skywalker", age: 24, gender: "male", condition: "Fracture", phone: "+1 (555) 901-3011", notes: "Prosthetic right limb integration check." },
  { name: "Leia Organa", age: 24, gender: "female", condition: "Migraine", phone: "+1 (555) 901-3012", notes: "Stress-induced tension headaches." },
  { name: "Han Solo", age: 35, gender: "male", condition: "Arthritis", phone: "+1 (555) 901-3013", notes: "Osteoarthritis in right knee from old injuries." },
  { name: "Lando Calrissian", age: 41, gender: "male", condition: "Hypertension", phone: "+1 (555) 901-3014", notes: "Prescribed ACE inhibitors." },
  { name: "Padme Amidala", age: 27, gender: "female", condition: "Thyroid Disorder", phone: "+1 (555) 901-3015", notes: "Hypothyroidism; taking levothyroxine 50mcg." },
  { name: "Obi-Wan Kenobi", age: 60, gender: "male", condition: "Chronic Pain", phone: "+1 (555) 901-3016", notes: "Cervical spine discomfort; physiotherapy planned." },
  { name: "Anakin Skywalker", age: 22, gender: "male", condition: "Infection", phone: "+1 (555) 901-3017", notes: "Severe dermatological burns and airway sensitivity." },
  { name: "Mace Windu", age: 52, gender: "male", condition: "Diabetes", phone: "+1 (555) 901-3018", notes: "Type 2 diabetes; HbA1c currently at 6.8%." },
  { name: "Qui-Gon Jinn", age: 58, gender: "male", condition: "Heart Disease", phone: "+1 (555) 901-3019", notes: "Arrhythmia diagnosed on routine Holter monitor." },
  { name: "Ahsoka Tano", age: 19, gender: "female", condition: "Allergy", phone: "+1 (555) 901-3020", notes: "Histamine reaction to penicillin class antibiotics." },
  { name: "Peter Parker", age: 17, gender: "male", condition: "Allergy", phone: "+1 (555) 901-3021", notes: "Insect venom hypersensitivity test ordered." },
  { name: "Tony Stark", age: 49, gender: "male", condition: "Heart Disease", phone: "+1 (555) 901-3022", notes: "Cardiac pacing implant follow-up." },
  { name: "Steve Rogers", age: 98, gender: "male", condition: "Arthritis", phone: "+1 (555) 901-3023", notes: "Exceptional vitality; minor joint wear." },
  { name: "Bruce Banner", age: 46, gender: "male", condition: "Hypertension", phone: "+1 (555) 901-3024", notes: "Elevated heart rate during stress events." },
  { name: "Natasha Romanoff", age: 34, gender: "female", condition: "Chronic Pain", phone: "+1 (555) 901-3025", notes: "Post-traumatic soft tissue lumbar strain." },
  { name: "Clint Barton", age: 42, gender: "male", condition: "Other", phone: "+1 (555) 901-3026", notes: "Sensorineural hearing loss; uses binaural aids." },
  { name: "Wanda Maximoff", age: 28, gender: "female", condition: "Depression", phone: "+1 (555) 901-3027", notes: "Grief counseling and CBT in progress." },
  { name: "Stephen Strange", age: 44, gender: "male", condition: "Fracture", phone: "+1 (555) 901-3028", notes: "Bilateral metacarpal post-fixation rehabilitation." },
  { name: "Carol Danvers", age: 36, gender: "female", condition: "Migraine", phone: "+1 (555) 901-3029", notes: "Cluster headaches responsive to triptans." },
  { name: "Sam Wilson", age: 37, gender: "male", condition: "Asthma", phone: "+1 (555) 901-3030", notes: "Controlled with albuterol as needed." },
  { name: "Bucky Barnes", age: 96, gender: "male", condition: "Depression", phone: "+1 (555) 901-3031", notes: "PTSD management and cognitive recovery." },
  { name: "James Rhodes", age: 50, gender: "male", condition: "Chronic Pain", phone: "+1 (555) 901-3032", notes: "Exoskeletal orthotic spinal therapy." },
  { name: "Scott Lang", age: 40, gender: "male", condition: "Diabetes", phone: "+1 (555) 901-3033", notes: "Diet-controlled pre-diabetic glucose levels." },
  { name: "Hope van Dyne", age: 38, gender: "female", condition: "Thyroid Disorder", phone: "+1 (555) 901-3034", notes: "Subclinical thyroiditis." },
  { name: "Peggy Carter", age: 92, gender: "female", condition: "Stroke", phone: "+1 (555) 901-3035", notes: "Mild transient ischemic attack; on aspirin therapy." },
  { name: "Charles Xavier", age: 62, gender: "male", condition: "Chronic Pain", phone: "+1 (555) 901-3036", notes: "Paraplegic neuro-muscular management." },
  { name: "Erik Lehnsherr", age: 64, gender: "male", condition: "Kidney Disease", phone: "+1 (555) 901-3037", notes: "Stage 2 chronic kidney disease; monitor eGFR." },
  { name: "Jean Grey", age: 27, gender: "female", condition: "Migraine", phone: "+1 (555) 901-3038", notes: "Intense frontal lobe cephalalgia." },
  { name: "Scott Summers", age: 28, gender: "male", condition: "Other", phone: "+1 (555) 901-3039", notes: "Ocular photophobia; requires tinted lenses." },
  { name: "Ororo Munroe", age: 33, gender: "female", condition: "Asthma", phone: "+1 (555) 901-3040", notes: "Claustrophobia-triggered hyperventilation." },
  { name: "Logan Howlett", age: 135, gender: "male", condition: "Liver Disease", phone: "+1 (555) 901-3041", notes: "Substance toxicity clearance monitoring." },
  { name: "Hank McCoy", age: 41, gender: "male", condition: "Arthritis", phone: "+1 (555) 901-3042", notes: "Joint inflammation and enlarged knuckles." },
  { name: "Kurt Wagner", age: 26, gender: "male", condition: "Heart Disease", phone: "+1 (555) 901-3043", notes: "Sinus bradycardia, asymptomatic." },
  { name: "Anna Marie LeBeau", age: 25, gender: "female", condition: "Anxiety", phone: "+1 (555) 901-3044", notes: "Social avoidance and tactile anxiety." },
  { name: "Remy LeBeau", age: 30, gender: "male", condition: "Fracture", phone: "+1 (555) 901-3045", notes: "Healed clavicle fracture, minor tenderness." },
  { name: "Clark Kent", age: 34, gender: "male", condition: "Allergy", phone: "+1 (555) 901-3046", notes: "Atypical mineral hypersensitivity reaction." },
  { name: "Lois Lane", age: 33, gender: "female", condition: "Migraine", phone: "+1 (555) 901-3047", notes: "Late night eye strain and recurring headaches." },
  { name: "Bruce Wayne", age: 43, gender: "male", condition: "Fracture", phone: "+1 (555) 901-3048", notes: "Multiple healed rib fractures, lumbar disk bulge." },
  { name: "Diana Prince", age: 110, gender: "female", condition: "Heart Disease", phone: "+1 (555) 901-3049", notes: "Cardiovascular endurance check: excellent." },
  { name: "Barry Allen", age: 27, gender: "male", condition: "Diabetes", phone: "+1 (555) 901-3050", notes: "High metabolic caloric turnover, hypoglycemia checks." },
  { name: "Arthur Curry", age: 36, gender: "male", condition: "Infection", phone: "+1 (555) 901-3051", notes: "Atypical marine bacterial exposure." },
  { name: "Victor Stone", age: 23, gender: "male", condition: "Other", phone: "+1 (555) 901-3052", notes: "Bio-synthetic neural junction review." },
  { name: "Oliver Queen", age: 38, gender: "male", condition: "Arthritis", phone: "+1 (555) 901-3053", notes: "Bilateral shoulder rotator cuff tendinitis." },
  { name: "Dinah Lance", age: 31, gender: "female", condition: "Other", phone: "+1 (555) 901-3054", notes: "Vocal cord nodules; speech therapy assigned." },
  { name: "Hal Jordan", age: 35, gender: "male", condition: "Anxiety", phone: "+1 (555) 901-3055", notes: "Occupational aviation stress syndrome." },
  { name: "John Stewart", age: 39, gender: "male", condition: "Hypertension", phone: "+1 (555) 901-3056", notes: "Essential hypertension; lifestyle modification." },
  { name: "Billy Batson", age: 14, gender: "male", condition: "Asthma", phone: "+1 (555) 901-3057", notes: "Childhood intermittent asthma." },
  { name: "Shazam Champion", age: 30, gender: "male", condition: "Chronic Pain", phone: "+1 (555) 901-3058", notes: "Idiopathic thoracic pain." },
  { name: "Barbara Gordon", age: 29, gender: "female", condition: "Chronic Pain", phone: "+1 (555) 901-3059", notes: "Spinal cord injury rehabilitation program." },
  { name: "Dick Grayson", age: 26, gender: "male", condition: "Fracture", phone: "+1 (555) 901-3060", notes: "Metatarsal stress fracture from athletic strain." },
  { name: "Jason Todd", age: 22, gender: "male", condition: "Depression", phone: "+1 (555) 901-3061", notes: "Emotional dysregulation and anger management." },
  { name: "Tim Drake", age: 20, gender: "male", condition: "Migraine", phone: "+1 (555) 901-3062", notes: "Sleep deprivation induced tension headaches." },
  { name: "Damian Wayne", age: 15, gender: "male", condition: "Allergy", phone: "+1 (555) 901-3063", notes: "Shellfish anaphylactic allergy." },
  { name: "Alfred Pennyworth", age: 67, gender: "male", condition: "Arthritis", phone: "+1 (555) 901-3064", notes: "Bilateral knee osteoarthritis; taking NSAIDs." },
  { name: "James Gordon", age: 59, gender: "male", condition: "Heart Disease", phone: "+1 (555) 901-3065", notes: "Post-myocardial infarction, stable on statin." },
];

async function seed() {
  try {
    console.log("🌱 Connecting to MongoDB Atlas...");
    await mongoose.connect(MONGODB_URI!, { bufferCommands: false });
    console.log("✅ MongoDB connected successfully!");

    console.log("🧹 Cleaning up existing collections...");
    await Promise.all([
      User.deleteMany({}),
      Doctor.deleteMany({}),
      Patient.deleteMany({}),
    ]);
    console.log("✅ Collections cleared.");

    // 1. Create Default Admin User
    console.log("👤 Creating default admin user...");
    const hashedPassword = await bcrypt.hash("password123", 12);
    const adminUser = await User.create({
      name: "Dr. Admin User",
      email: "admin@doctortracker.com",
      password: hashedPassword,
      role: "admin",
    });
    console.log(`✅ Admin user created: ${adminUser.email}`);

    // 2. Create Doctors
    console.log("🩺 Creating 20 clinical doctors across specialties...");
    const createdDoctors = await Doctor.insertMany(
      DOCTORS_DATA.map((doc, idx) => {
        // Vary creation dates over the last 10 months for rich analytics
        const monthsAgo = (idx % 10);
        const createdAt = new Date();
        createdAt.setMonth(createdAt.getMonth() - monthsAgo);
        createdAt.setDate(Math.max(1, (idx * 3) % 28));

        return {
          ...doc,
          createdAt,
          updatedAt: createdAt,
        };
      })
    );
    console.log(`✅ Created ${createdDoctors.length} doctors.`);

    // 3. Create Patients Distributed Across Doctors
    console.log("👥 Distributing 65 patients across medical practitioners...");
    const patientsToInsert = PATIENTS_POOL.map((p, index) => {
      // Distribute patients: assign 2 to 5 patients per doctor
      const assignedDoctor = createdDoctors[index % createdDoctors.length];

      // Stagger registration dates over the past 12 months for trend analytics
      const monthsAgo = index % 12;
      const createdAt = new Date();
      createdAt.setMonth(createdAt.getMonth() - monthsAgo);
      createdAt.setDate(Math.max(1, (index * 7) % 28));

      return {
        doctorId: assignedDoctor._id,
        name: p.name,
        age: p.age,
        gender: p.gender,
        condition: p.condition,
        phone: p.phone,
        email: `${p.name.toLowerCase().replace(/[^a-z0-9]/g, ".")}@example.com`,
        address: `${100 + index} Health Boulevard, Suite ${index + 1}`,
        notes: p.notes,
        createdAt,
        updatedAt: createdAt,
      };
    });

    const createdPatients = await Patient.insertMany(patientsToInsert);
    console.log(`✅ Created ${createdPatients.length} patient records.`);

    // 4. Update each doctor's patientCount
    console.log("🔄 Synchronizing doctor patient counts...");
    for (const doc of createdDoctors) {
      const count = await Patient.countDocuments({ doctorId: doc._id });
      await Doctor.findByIdAndUpdate(doc._id, { patientCount: count });
    }
    console.log("✅ Doctor patient counts updated.");

    console.log("\n==================================================");
    console.log("🎉 DATABASE SEEDED SUCCESSFULLY!");
    console.log("==================================================");
    console.log("Admin Email:    admin@doctortracker.com");
    console.log("Admin Password: password123");
    console.log(`Total Doctors:  ${createdDoctors.length}`);
    console.log(`Total Patients: ${createdPatients.length}`);
    console.log("==================================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding database:", err);
    process.exit(1);
  }
}

seed();
