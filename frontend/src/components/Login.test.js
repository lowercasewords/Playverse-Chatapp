import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import authService from '../services/authService';

// Mock authService to avoid real API calls.
jest.mock('../services/authService', () => ({
  __esModule: true,
  default: {
    login: jest.fn(),
  },
}));

describe('Login Component Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    authService.login.mockClear();
  });

  it('renders the login form', () => {
    // Wrap the Login component with MemoryRouter
    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    // Use container.querySelector to locate the email and password inputs
    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    const loginButton = screen.getByRole('button', { name: /login/i });
    expect(loginButton).toBeInTheDocument();
  });

  it('calls authService.login and stores token on form submission', async () => {
    const fakeToken = 'fake-token';
    authService.login.mockResolvedValue(fakeToken);

    const { container } = render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );
    // Get the inputs by querying the DOM directly
    const emailInput = container.querySelector('input[name="email"]');
    const passwordInput = container.querySelector('input[name="password"]');
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();

    // Simulate user input
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const loginButton = screen.getByRole('button', { name: /login/i });
    await act(async () => {
      fireEvent.click(loginButton);
    });

    // Wait for the login function to be called with the correct parameters.
    await waitFor(() =>
      expect(authService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    );

    // Check that the token is stored in localStorage.
    expect(localStorage.getItem('token')).toEqual(fakeToken);
  });
});
