"use strict";

const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

// Create a new task
router.post('/', async (req, res) => {
  console.log('Received new task:', req.body); // Debug log
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    assignedTo: req.body.assignedTo,
    dueDate: req.body.dueDate,
    attachment: req.body.attachment,
    checklist: req.body.checklist,
    priority: req.body.priority,
    progress: req.body.progress
  });
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Update a task
router.patch('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.status !== undefined) task.status = req.body.status;
    if (req.body.assignedTo !== undefined) task.assignedTo = req.body.assignedTo;
    if (req.body.dueDate !== undefined) task.dueDate = req.body.dueDate;
    if (req.body.attachment !== undefined) task.attachment = req.body.attachment;
    if (req.body.checklist !== undefined) task.checklist = req.body.checklist;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.progress !== undefined) task.progress = req.body.progress;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
});

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});
module.exports = router;