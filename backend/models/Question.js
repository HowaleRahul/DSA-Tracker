const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const questionSchema = new Schema({
  name: { type: String, required: true },
  url: { type: String },
  platform: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  tags: { type: [String], required: true },
  approach: { type: String },
  timeComplexity: { type: String },
  confidence: { type: Number, required: true, min: 1, max: 5 },
  lastRevised: { type: Date, required: true },
  mistakes: { type: String }
}, {
  timestamps: true,
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;
