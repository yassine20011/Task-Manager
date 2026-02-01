import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthProvider } from '../context/AuthContext';
import axios from 'axios';

const mockTasks = [
  { id: 1, title: 'Task 1', description: 'Description 1', status: 'OPEN' },
  { id: 2, title: 'Task 2', description: 'Description 2', status: 'DONE' },
];

const MockDashboard = () => {
  localStorage.getItem.mockReturnValue('test-token');
  
  return (
    <BrowserRouter>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue('test-token');
  });

  it('should render dashboard and fetch tasks', async () => {
    axios.get.mockResolvedValue({ data: mockTasks });
    
    render(<MockDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/task manager/i)).toBeInTheDocument();
      expect(screen.getByText('Task 1')).toBeInTheDocument();
      expect(screen.getByText('Task 2')).toBeInTheDocument();
    });
  });

  it('should display empty state when no tasks', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(<MockDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    });
  });

  it('should add a new task', async () => {
    axios.get.mockResolvedValue({ data: [] });
    const newTask = { id: 3, title: 'New Task', description: 'New Description', status: 'OPEN' };
    axios.post.mockResolvedValue({ data: newTask });
    
    render(<MockDashboard />);
    
    await waitFor(() => {
      const titleInputs = screen.getAllByRole('textbox');
      expect(titleInputs.length).toBeGreaterThan(0);
    });

    const inputs = screen.getAllByRole('textbox');
    const titleInput = inputs[0];
    const descriptionInput = inputs[1];
    const addButton = screen.getByRole('button', { name: /add/i });

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/tasks',
        { title: 'New Task', description: 'New Description' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });

  it('should have logout button', async () => {
    axios.get.mockResolvedValue({ data: [] });
    
    render(<MockDashboard />);
    
    await waitFor(() => {
      expect(screen.getByText(/logout/i)).toBeInTheDocument();
    });
  });
});
