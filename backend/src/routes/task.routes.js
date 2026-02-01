const express = require('express');
const prisma = require('../lib/prisma');
const authMiddleware = require('../middleware/auth.middleware');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all tasks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Create task
router.post(
  '/',
  [authMiddleware, body('title').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, status } = req.body;

    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          status: status || 'OPEN',
          userId: req.user.userId,
        },
      });
      res.json(task);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  },
);

// Update task
router.put('/:id', authMiddleware, async (req, res) => {
  const { title, description, status } = req.body;

  try {
    let task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure user owns task
    if (task.userId !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    task = await prisma.task.update({
      where: { id: parseInt(req.params.id) },
      data: { title, description, status },
    });

    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete task
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Make sure user owns task
    if (task.userId !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await prisma.task.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
