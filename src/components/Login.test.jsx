// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';
import { AppContext } from '../App';
import { authService } from '../services/authService';

// Mock authService.login to return success immediately
vi.mock('../services/authService', () => ({
  authService: {
    login: vi.fn().mockResolvedValue({
      user: { id: 2, name: 'Jane Doe', email: 'jane@example.com', role: 'user' },
      message: 'Login successful'
    }),
    getCurrentUser: vi.fn().mockReturnValue(null)
  }
}));

describe('Login component Quick Demo Access', () => {
  it('calls setCurrentUser and does not throw ReferenceError when Customer Portal button is clicked', async () => {
    const mockSetCurrentUser = vi.fn();
    const mockAddToast = vi.fn();
    const mockSyncCart = vi.fn();

    render(
      <AppContext.Provider value={{
        addToast: mockAddToast,
        syncCart: mockSyncCart,
        setCurrentUser: mockSetCurrentUser
      }}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </AppContext.Provider>
    );

    // Find the "Customer Portal" quick login button
    const customerPortalBtn = screen.getByRole('button', { name: /Customer Portal/i });
    expect(customerPortalBtn).toBeDefined();

    // Click it. This calls handleQuickLogin('user'), which calls setUser(data.user) inside.
    // If setUser is undefined, this throws a ReferenceError.
    fireEvent.click(customerPortalBtn);

    // Wait and verify if mockSetCurrentUser (our context value for setCurrentUser) or any throw happens
    await waitFor(() => {
      expect(mockSetCurrentUser).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'user' })
      );
    });
  });
});
