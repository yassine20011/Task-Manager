import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../pages/Login';
import { AuthProvider } from '../context/AuthContext';

const MockLogin = () => (
  <BrowserRouter>
    <AuthProvider>
      <Login />
    </AuthProvider>
  </BrowserRouter>
);

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with all elements', () => {
    render(<MockLogin />);
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('should have a link to register page', () => {
    render(<MockLogin />);
    
    const registerLink = screen.getByText(/^register$/i);
    expect(registerLink).toBeInTheDocument();
    expect(registerLink.closest('a')).toHaveAttribute('href', '/register');
  });
});
