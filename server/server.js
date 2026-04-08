require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const {
  User, Prescription, Medicine, Appointment,
  Doctor, Vital, Document, FamilyMember,
  Reminder, EmergencyCard,
} = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ──────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── MongoDB Connection ─────────────────────────────────
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// ─── Auth Middleware ────────────────────────────────────
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token, access denied' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ─── Multer Config ──────────────────────────────────────
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ═════════════════════════════════════════════════════════
// AUTH ROUTES
// ═════════════════════════════════════════════════════════

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ error: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, bloodGroup, notificationPrefs } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, dateOfBirth, bloodGroup, notificationPrefs },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// PRESCRIPTION ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/prescriptions', auth, async (req, res) => {
  try {
    const items = await Prescription.find({ userId: req.userId }).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/prescriptions', auth, async (req, res) => {
  try {
    const item = await Prescription.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/prescriptions/:id', auth, async (req, res) => {
  try {
    const item = await Prescription.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/prescriptions/:id', auth, async (req, res) => {
  try {
    const item = await Prescription.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// MEDICINE ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/medicines', auth, async (req, res) => {
  try {
    const items = await Medicine.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/medicines', auth, async (req, res) => {
  try {
    const item = await Medicine.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/medicines/:id', auth, async (req, res) => {
  try {
    const item = await Medicine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/medicines/:id', auth, async (req, res) => {
  try {
    const item = await Medicine.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark medicine as taken
app.post('/api/medicines/:id/take', auth, async (req, res) => {
  try {
    const { date, time } = req.body;
    const medicine = await Medicine.findOne({ _id: req.params.id, userId: req.userId });
    if (!medicine) return res.status(404).json({ error: 'Not found' });
    medicine.taken.push({ date, time, taken: true });
    await medicine.save();
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// APPOINTMENT ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/appointments', auth, async (req, res) => {
  try {
    const items = await Appointment.find({ userId: req.userId }).sort({ date: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', auth, async (req, res) => {
  try {
    const item = await Appointment.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', auth, async (req, res) => {
  try {
    const item = await Appointment.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/appointments/:id', auth, async (req, res) => {
  try {
    const item = await Appointment.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// DOCTOR ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/doctors', auth, async (req, res) => {
  try {
    const items = await Doctor.find({ userId: req.userId }).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/doctors', auth, async (req, res) => {
  try {
    const item = await Doctor.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/doctors/:id', auth, async (req, res) => {
  try {
    const item = await Doctor.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/doctors/:id', auth, async (req, res) => {
  try {
    const item = await Doctor.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// VITAL ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/vitals', auth, async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.userId };
    if (type) filter.type = type;
    const items = await Vital.find(filter).sort({ date: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vitals', auth, async (req, res) => {
  try {
    const item = await Vital.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/vitals/:id', auth, async (req, res) => {
  try {
    const item = await Vital.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// DOCUMENT ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/documents', auth, async (req, res) => {
  try {
    const items = await Document.find({ userId: req.userId }).sort({ uploadDate: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/documents', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const item = await Document.create({
      userId: req.userId,
      title: req.body.title || req.file.originalname,
      category: req.body.category || 'other',
      fileName: req.file.originalname,
      filePath: req.file.filename,
      fileSize: req.file.size,
    });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/documents/:id', auth, async (req, res) => {
  try {
    const item = await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    // Delete file from disk
    const filePath = path.join(uploadDir, item.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// FAMILY MEMBER ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/family', auth, async (req, res) => {
  try {
    const items = await FamilyMember.find({ userId: req.userId }).sort({ name: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/family', auth, async (req, res) => {
  try {
    const item = await FamilyMember.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/family/:id', auth, async (req, res) => {
  try {
    const item = await FamilyMember.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/family/:id', auth, async (req, res) => {
  try {
    const item = await FamilyMember.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// REMINDER ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/reminders', auth, async (req, res) => {
  try {
    const items = await Reminder.find({ userId: req.userId }).sort({ dateTime: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reminders', auth, async (req, res) => {
  try {
    const item = await Reminder.create({ ...req.body, userId: req.userId });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reminders/:id', auth, async (req, res) => {
  try {
    const item = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, req.body, { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reminders/:id', auth, async (req, res) => {
  try {
    const item = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// EMERGENCY CARD ROUTES
// ═════════════════════════════════════════════════════════

app.get('/api/emergency', auth, async (req, res) => {
  try {
    let card = await EmergencyCard.findOne({ userId: req.userId });
    if (!card) {
      card = await EmergencyCard.create({ userId: req.userId });
    }
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/emergency', auth, async (req, res) => {
  try {
    const card = await EmergencyCard.findOneAndUpdate(
      { userId: req.userId }, req.body, { new: true, upsert: true }
    );
    res.json(card);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public shareable emergency card (by user ID)
app.get('/api/emergency/share/:userId', async (req, res) => {
  try {
    const card = await EmergencyCard.findOne({ userId: req.params.userId });
    if (!card) return res.status(404).json({ error: 'No emergency card found' });
    const user = await User.findById(req.params.userId).select('name');
    res.json({ ...card.toObject(), userName: user?.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// DASHBOARD SUMMARY
// ═════════════════════════════════════════════════════════

app.get('/api/dashboard/summary', auth, async (req, res) => {
  try {
    const [prescriptions, medicines, appointments, vitals, reminders] = await Promise.all([
      Prescription.countDocuments({ userId: req.userId }),
      Medicine.find({ userId: req.userId }),
      Appointment.find({ userId: req.userId, date: { $gte: new Date() }, status: 'upcoming' })
        .sort({ date: 1 }).limit(5),
      Vital.find({ userId: req.userId }).sort({ date: -1 }).limit(10),
      Reminder.find({ userId: req.userId, isRead: false }).sort({ dateTime: 1 }).limit(5),
    ]);
    res.json({
      totalPrescriptions: prescriptions,
      activeMedicines: medicines.filter(m => !m.endDate || new Date(m.endDate) >= new Date()).length,
      upcomingAppointments: appointments,
      recentVitals: vitals,
      unreadReminders: reminders,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ═════════════════════════════════════════════════════════
// HEALTH REPORT EXPORT
// ═════════════════════════════════════════════════════════

app.get('/api/export/health-report', auth, async (req, res) => {
  try {
    const [user, prescriptions, medicines, appointments, vitals, doctors, familyMembers, emergencyCard] = await Promise.all([
      User.findById(req.userId).select('-password'),
      Prescription.find({ userId: req.userId }).sort({ date: -1 }),
      Medicine.find({ userId: req.userId }),
      Appointment.find({ userId: req.userId }).sort({ date: -1 }),
      Vital.find({ userId: req.userId }).sort({ date: -1 }),
      Doctor.find({ userId: req.userId }),
      FamilyMember.find({ userId: req.userId }),
      EmergencyCard.findOne({ userId: req.userId }),
    ]);
    res.json({ user, prescriptions, medicines, appointments, vitals, doctors, familyMembers, emergencyCard });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
