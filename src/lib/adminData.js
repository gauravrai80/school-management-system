// ===================== SEED DATA =====================
const seedStudents = [];

const seedTeachers = [];

const seedAnnouncements = [];

const seedActivities = [];

// ===================== SEED DATA (new modules) =====================
const seedBooks = [];

const seedRoutes = [];

const seedTimetable = [];

const seedHomework = [];

const seedExams = [];

const seedGrades = [];

const seedMessages = [];

const seedSettings = {
  name: "Aethelgard Academy",
  address: "42 Academy Lane, Cambridge, UK",
  phone: "+44 1234 567 890",
  email: "info@aethelgard.edu",
  academicYear: "2025-2026",
  smsNotifications: true,
  emailNotifications: true,
};

// ===================== STORAGE HELPERS =====================
const KEYS = {
  students: "admin_students",
  teachers: "admin_teachers",
  attendance: "admin_attendance",
  payments: "admin_payments",
  announcements: "admin_announcements",
  activities: "admin_activities",
  auth: "admin_auth",
  grades: "admin_grades",
  timetables: "admin_timetables",
  homework: "admin_homework",
  exams: "admin_exams",
  books: "admin_books",
  bookIssues: "admin_book_issues",
  routes: "admin_routes",
  settings: "admin_settings",
  messages: "admin_messages",
};

function getOrSeed(key, seed) {
  const stored = localStorage.getItem(key);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(key, JSON.stringify(seed));
  return seed;
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===================== PUBLIC API =====================
export function getStudents() { return getOrSeed(KEYS.students, seedStudents); }
export function saveStudents(data) { save(KEYS.students, data); }

export function getTeachers() { return getOrSeed(KEYS.teachers, seedTeachers); }
export function saveTeachers(data) { save(KEYS.teachers, data); }

export function getAttendanceRecords() { return getOrSeed(KEYS.attendance, []); }
export function saveAttendanceRecords(data) { save(KEYS.attendance, data); }

export function getPayments() { return getOrSeed(KEYS.payments, []); }
export function savePayments(data) { save(KEYS.payments, data); }

export function getAnnouncements() { return getOrSeed(KEYS.announcements, seedAnnouncements); }
export function saveAnnouncements(data) { save(KEYS.announcements, data); }

export function getActivities() { return getOrSeed(KEYS.activities, seedActivities); }
export function addActivity(action) {
  const acts = getActivities();
  acts.unshift({ id: `ac${Date.now()}`, action, time: "Just now" });
  save(KEYS.activities, acts.slice(0, 20));
}

export function getGrades() { return getOrSeed(KEYS.grades, seedGrades); }
export function saveGrades(data) { save(KEYS.grades, data); }

export function getTimetables() { return getOrSeed(KEYS.timetables, seedTimetable); }
export function saveTimetables(data) { save(KEYS.timetables, data); }

export function getHomework() { return getOrSeed(KEYS.homework, seedHomework); }
export function saveHomework(data) { save(KEYS.homework, data); }

export function getExams() { return getOrSeed(KEYS.exams, seedExams); }
export function saveExams(data) { save(KEYS.exams, data); }

export function getBooks() { return getOrSeed(KEYS.books, seedBooks); }
export function saveBooks(data) { save(KEYS.books, data); }

export function getBookIssues() { return getOrSeed(KEYS.bookIssues, []); }
export function saveBookIssues(data) { save(KEYS.bookIssues, data); }

export function getRoutes() { return getOrSeed(KEYS.routes, seedRoutes); }
export function saveRoutes(data) { save(KEYS.routes, data); }

export function getSettings() { return getOrSeed(KEYS.settings, seedSettings); }
export function saveSettings(data) { save(KEYS.settings, data); }

export function getMessages() { return getOrSeed(KEYS.messages, seedMessages); }
export function saveMessages(data) { save(KEYS.messages, data); }

// ===================== AUTH =====================
export const credentials = {
  "admin@school.com": { password: "admin123", role: "admin" },
  "teacher@school.com": { password: "teacher123", role: "teacher" },
  "student@school.com": { password: "student123", role: "student" },
  "parent@school.com": { password: "parent123", role: "parent" },
};

export function loginUser(email, password) {
  const cred = credentials[email];
  if (cred && cred.password === password) {
    save(KEYS.auth, { loggedIn: true, role: cred.role, email });
    return cred.role;
  }
  return null;
}

// Keep old function for backward compat
export function loginAdmin(email, password) {
  return loginUser(email, password) !== null;
}

export function isLoggedIn() {
  const auth = localStorage.getItem(KEYS.auth);
  if (!auth) return false;
  return JSON.parse(auth).loggedIn === true;
}

export function getAuthRole() {
  const auth = localStorage.getItem(KEYS.auth);
  if (!auth) return "admin";
  return JSON.parse(auth).role || "admin";
}

export function getAuthEmail() {
  const auth = localStorage.getItem(KEYS.auth);
  if (!auth) return "";
  return JSON.parse(auth).email || "";
}

export function logoutAdmin() {
  localStorage.removeItem(KEYS.auth);
}

export function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

// ===================== STATIC DATA =====================
export const feeStructure = [];

export const weeklyAttendance = [];

export const monthlyFees = [];

export const gradeDistribution = [];

export const subjectPerformance = [];

export const enrollmentTrend = [];

export const allSubjects = ["Mathematics", "Science", "English", "History", "Physical Ed"];
