import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Register from '../pages/Register';
import { AuthProvider } from '../context/AuthContext';

const MockRegister = () => (
  <BrowserRouter>
    <AuthProvider>
      <Register />
    </AuthProvider>
  </BrowserRouter>
);

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render register form with all elements', () => {
    render(<MockRegister />);
    
    expect(screen.getByText(/create account/i)).toBeInTheDocument();
    expect(screen.getByText(/^name$/i)).toBeInTheDocument();
    expect(screen.getByText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^register$/i })).toBeInTheDocument();
  });

  it('should have a link to login page', () => {
    render(<MockRegister />);
    
    const loginLink = screen.getByText(/^login$/i);
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
