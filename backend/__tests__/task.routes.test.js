const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const taskRoutes = require('../src/routes/task.routes');

// Mock prisma
jest.mock('../src/lib/prisma', () => ({
  task: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

const prisma = require('../src/lib/prisma');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';

// Helper to create a valid token
const createToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET);
};

describe('Task Routes', () => {
  const userId = 1;
  let token;

  beforeEach(() => {
    jest.clearAllMocks();
    token = createToken(userId);
  });

  describe('GET /api/tasks', () => {
    test('should get all tasks for authenticated user', async () => {
      const mockTasks = [
        { id: 1, title: 'Task 1', description: 'Description 1', status: 'OPEN', userId },
        { id: 2, title: 'Task 2', description: 'Description 2', status: 'DONE', userId },
      ];

      prisma.task.findMany.mockResolvedValue(mockTasks);

      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockTasks);
      expect(prisma.task.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    });

    test('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/tasks');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'No token, authorization denied' });
    });

    test('should return 401 if token is invalid', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Token is not valid' });
    });
  });

  describe('POST /api/tasks', () => {
    test('should create a new task successfully', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Task description',
      };

      const createdTask = {
        id: 1,
        title: newTask.title,
        description: newTask.description,
        status: 'OPEN',
        userId,
        createdAt: new Date().toISOString(),
      };

      prisma.task.create.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        id: 1,
        title: newTask.title,
        description: newTask.description,
        status: 'OPEN',
        userId,
      });
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: newTask.title,
          description: newTask.description,
          status: 'OPEN',
          userId,
        },
      });
    });

    test('should create task with default status if not provided', async () => {
      const newTask = {
        title: 'New Task',
        description: 'Task description',
      };

      const createdTask = {
        id: 1,
        ...newTask,
        status: 'OPEN',
        userId,
        createdAt: new Date(),
      };

      prisma.task.create.mockResolvedValue(createdTask);

      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send(newTask);

      expect(response.status).toBe(200);
      expect(prisma.task.create).toHaveBeenCalledWith({
        data: {
          title: newTask.title,
          description: newTask.description,
          status: 'OPEN',
          userId,
        },
      });
    });

    test('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({ description: 'Description only' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return 401 if no token is provided', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({ title: 'Task' });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/tasks/:id', () => {
    test('should update a task successfully', async () => {
      const taskId = 1;
      const existingTask = {
        id: taskId,
        title: 'Old Title',
        description: 'Old description',
        status: 'OPEN',
        userId,
      };

      const updatedData = {
        title: 'Updated Title',
        description: 'Updated description',
        status: 'DONE',
      };

      const updatedTask = {
        id: taskId,
        ...updatedData,
        userId,
      };

      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.update.mockResolvedValue(updatedTask);

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedTask);
      expect(prisma.task.update).toHaveBeenCalledWith({
        where: { id: taskId },
        data: updatedData,
      });
    });

    test('should return 404 if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/tasks/999')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Task not found' });
    });

    test('should return 401 if user does not own the task', async () => {
      const taskId = 1;
      const existingTask = {
        id: taskId,
        title: 'Task',
        userId: 999, // Different user
      };

      prisma.task.findUnique.mockResolvedValue(existingTask);

      const response = await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Updated' });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Not authorized' });
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete a task successfully', async () => {
      const taskId = 1;
      const existingTask = {
        id: taskId,
        title: 'Task to delete',
        userId,
      };

      prisma.task.findUnique.mockResolvedValue(existingTask);
      prisma.task.delete.mockResolvedValue(existingTask);

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Task removed' });
      expect(prisma.task.delete).toHaveBeenCalledWith({
        where: { id: taskId },
      });
    });

    test('should return 404 if task not found', async () => {
      prisma.task.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/tasks/999')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: 'Task not found' });
    });

    test('should return 401 if user does not own the task', async () => {
      const taskId = 1;
      const existingTask = {
        id: taskId,
        title: 'Task',
        userId: 999, // Different user
      };

      prisma.task.findUnique.mockResolvedValue(existingTask);

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: 'Not authorized' });
    });

    test('should return 401 if no token is provided', async () => {
      const response = await request(app).delete('/api/tasks/1');

      expect(response.status).toBe(401);
    });
  });
});
