import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import App from '../App';
import axios from 'axios';

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] });
  });

  it('should render login page for unauthenticated user', () => {
    localStorage.getItem.mockReturnValue(null);
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('should render dashboard for authenticated user', async () => {
    localStorage.getItem.mockReturnValue('test-token');
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/task manager/i)).toBeInTheDocument();
    });
  });

  it('should redirect to dashboard if authenticated user visits login', () => {
    localStorage.getItem.mockReturnValue('test-token');
    
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );
    
    // Should redirect to dashboard
    waitFor(() => {
      expect(screen.queryByText(/sign in to your account/i)).not.toBeInTheDocument();
    });
  });

  it('should redirect to login if unauthenticated user visits dashboard', () => {
    localStorage.getItem.mockReturnValue(null);
    
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });
});
