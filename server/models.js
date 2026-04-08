const mongoose = require('mongoose');

// ─── User ───────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String, default: '' },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String, default: '' },
  notificationPrefs: {
    medicine: { type: Boolean, default: true },
    appointment: { type: Boolean, default: true },
    healthCheckup: { type: Boolean, default: true },
  },
}, { timestamps: true });

// ─── Prescription ───────────────────────────────────────
const prescriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, required: true },
  diagnosis: { type: String, default: '' },
  medicines: [{ name: String, dosage: String, duration: String }],
  notes: { type: String, default: '' },
}, { timestamps: true });

// ─── Medicine ───────────────────────────────────────────
const medicineSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'as-needed'], default: 'daily' },
  times: [String], // e.g. ["08:00", "20:00"]
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  taken: [{ date: Date, time: String, taken: Boolean }],
}, { timestamps: true });

// ─── Appointment ────────────────────────────────────────
const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorName: { type: String, required: true },
  specialty: { type: String, default: '' },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, default: '' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['upcoming', 'completed', 'cancelled'], default: 'upcoming' },
}, { timestamps: true });

// ─── Doctor ─────────────────────────────────────────────
const doctorSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  clinicName: { type: String, default: '' },
  clinicAddress: { type: String, default: '' },
}, { timestamps: true });

// ─── Vital ──────────────────────────────────────────────
const vitalSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['bp', 'blood-sugar', 'weight', 'temperature'], required: true },
  value: { type: String, required: true }, // "120/80" for BP, "98.6" for temp, etc.
  unit: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
}, { timestamps: true });

// ─── Document ───────────────────────────────────────────
const documentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  category: { type: String, enum: ['lab-report', 'x-ray', 'insurance', 'prescription', 'other'], default: 'other' },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  fileSize: { type: Number },
  uploadDate: { type: Date, default: Date.now },
}, { timestamps: true });

// ─── Family Member ──────────────────────────────────────
const familyMemberSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  relation: { type: String, required: true },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String, default: '' },
  allergies: [String],
  conditions: [String],
}, { timestamps: true });

// ─── Reminder ───────────────────────────────────────────
const reminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['medicine', 'appointment', 'health-checkup'], required: true },
  title: { type: String, required: true },
  message: { type: String, default: '' },
  dateTime: { type: Date, required: true },
  isRead: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

// ─── Emergency Card ─────────────────────────────────────
const emergencyCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  bloodGroup: { type: String, default: '' },
  allergies: [String],
  conditions: [String],
  currentMedications: [String],
  emergencyContacts: [{
    name: String,
    relation: String,
    phone: String,
  }],
}, { timestamps: true });

// ─── Export all models ──────────────────────────────────
module.exports = {
  User: mongoose.model('User', userSchema),
  Prescription: mongoose.model('Prescription', prescriptionSchema),
  Medicine: mongoose.model('Medicine', medicineSchema),
  Appointment: mongoose.model('Appointment', appointmentSchema),
  Doctor: mongoose.model('Doctor', doctorSchema),
  Vital: mongoose.model('Vital', vitalSchema),
  Document: mongoose.model('Document', documentSchema),
  FamilyMember: mongoose.model('FamilyMember', familyMemberSchema),
  Reminder: mongoose.model('Reminder', reminderSchema),
  EmergencyCard: mongoose.model('EmergencyCard', emergencyCardSchema),
};
