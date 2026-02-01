import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { useContext } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AuthContext, { AuthProvider } from '../context/AuthContext';
import axios from 'axios';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const wrapper = ({ children }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('should initialize with token from localStorage', () => {
    const token = 'test-token';
    localStorage.getItem.mockReturnValue(token);

    const TestComponent = () => {
      const { user } = useContext(AuthContext);
      return <div>{user ? 'Logged in' : 'Not logged in'}</div>;
    };

    render(<TestComponent />, { wrapper });
    expect(screen.getByText('Logged in')).toBeInTheDocument();
  });

  it('should initialize without user if no token in localStorage', () => {
    localStorage.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const { user } = useContext(AuthContext);
      return <div>{user ? 'Logged in' : 'Not logged in'}</div>;
    };

    render(<TestComponent />, { wrapper });
    expect(screen.getByText('Not logged in')).toBeInTheDocument();
  });

  it('should login successfully', async () => {
    const token = 'new-token';
    axios.post.mockResolvedValue({ data: { token } });

    const TestComponent = () => {
      const { login, user } = useContext(AuthContext);

      const handleLogin = async () => {
        await login('test@example.com', 'password123');
      };

      return (
        <div>
          <button onClick={handleLogin}>Login</button>
          <div>{user ? 'Logged in' : 'Not logged in'}</div>
        </div>
      );
    };

    render(<TestComponent />, { wrapper });
    
    const loginButton = screen.getByText('Login');
    loginButton.click();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
    });
  });

  it('should register successfully', async () => {
    const token = 'new-token';
    axios.post.mockResolvedValue({ data: { token } });

    const TestComponent = () => {
      const { register } = useContext(AuthContext);

      const handleRegister = async () => {
        await register('Test User', 'test@example.com', 'password123');
      };

      return <button onClick={handleRegister}>Register</button>;
    };

    render(<TestComponent />, { wrapper });
    
    const registerButton = screen.getByText('Register');
    registerButton.click();

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/auth/register', {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
      expect(localStorage.setItem).toHaveBeenCalledWith('token', token);
    });
  });

  it('should logout successfully', async () => {
    localStorage.getItem.mockReturnValue('test-token');

    const TestComponent = () => {
      const { logout, user } = useContext(AuthContext);

      return (
        <div>
          <button onClick={logout}>Logout</button>
          <div>{user ? 'Logged in' : 'Not logged in'}</div>
        </div>
      );
    };

    render(<TestComponent />, { wrapper });
    
    expect(screen.getByText('Logged in')).toBeInTheDocument();
    
    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    await waitFor(() => {
      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(screen.getByText('Not logged in')).toBeInTheDocument();
    });
  });
});
