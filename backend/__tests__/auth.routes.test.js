const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const _jwt = require('jsonwebtoken');
const authRoutes = require('../src/routes/auth.routes');

// Mock prisma
jest.mock('../src/lib/prisma', () => ({
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
}));

const prisma = require('../src/lib/prisma');

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Mock environment variables
process.env.JWT_SECRET = 'test-secret';

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      prisma.user.findUnique.mockResolvedValue(null);
      prisma.user.create.mockResolvedValue({
        id: 1,
        ...userData,
        password: 'hashedPassword',
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userData.email },
      });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    test('should return 400 if user already exists', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      };

      prisma.user.findUnique.mockResolvedValue({ id: 1, email: userData.email });

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'User already exists' });
    });

    test('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 if password is too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: '123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });

    test('should return 400 if name is empty', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: '',
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    test('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const hashedPassword = await bcrypt.hash(loginData.password, 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: loginData.email,
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginData.email },
      });
    });

    test('should return 400 if user does not exist', async () => {
      prisma.user.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    test('should return 400 if password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      prisma.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password: hashedPassword,
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    test('should return 400 if email is invalid', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123',
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });
});
