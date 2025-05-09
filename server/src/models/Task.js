const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  assignedTo: {
    type: String,
    default: ''
  },
  dueDate: {
    type: String, // store as string for simplicity
    default: ''
  },
  attachment: {
    type: String
  },
  checklist: [checklistItemSchema],
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  progress: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Task', taskSchema);
