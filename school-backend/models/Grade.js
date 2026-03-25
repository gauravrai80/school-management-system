const mongoose = require('mongoose');

const gradeSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Student',
    required: true,
  },
  examId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: true,
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
  },
  marksObtained: {
    type: Number,
    required: [true, 'Please add marks obtained'],
  },
  totalMarks: {
    type: Number,
    required: [true, 'Please add total marks'],
  },
  grade: {
    type: String,
  },
  teacherId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Teacher',
    required: true,
  },
});

// Auto-calculate grade before saving
gradeSchema.pre('save', function (next) {
  const pct = (this.marksObtained / this.totalMarks) * 100;
  if (pct >= 90) this.grade = 'A';
  else if (pct >= 80) this.grade = 'B';
  else if (pct >= 70) this.grade = 'C';
  else if (pct >= 60) this.grade = 'D';
  else this.grade = 'F';
  next();
});

module.exports = mongoose.model('Grade', gradeSchema);
