// File: frontend/src/components/Contacts.test.js

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import Contacts from './Contacts';

jest.mock('../services/contactService', () => ({
  __esModule: true,
  default: {
    getContacts: jest.fn(),
    addContact: jest.fn(),
  },
}));

describe('Contacts Component Tests', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'dummy-token');
    const contactService = require('../services/contactService').default;
    // Default: return an object with contacts array.
    contactService.getContacts.mockResolvedValue({
      contacts: [
        { _id: 'contact1', email: 'contact1@example.com' },
        { _id: 'contact2', email: 'contact2@example.com' },
      ],
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('renders a list of contacts', async () => {
    await act(async () => {
      render(<Contacts />);
    });
    await waitFor(() => expect(screen.getByText('contact1@example.com')).toBeInTheDocument());
    expect(screen.getByText('contact2@example.com')).toBeInTheDocument();
  });

  it('shows error message when adding a contact fails', async () => {
    const contactService = require('../services/contactService').default;
    // Override addContact to reject with error "Failed to add contact"
    contactService.addContact.mockRejectedValue(new Error("Failed to add contact"));
    
    await act(async () => {
      render(<Contacts />);
    });
    // Use querySelector to locate the email input if getByLabelText isn't working
    const input = document.querySelector('input[type="email"]');
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'fail@example.com' } });
    const button = screen.getByRole('button', { name: /Add Contact/i });
    fireEvent.click(button);
    // Expect the error message "Failed to add contact" to be displayed
    await waitFor(() => expect(screen.getByText(/Failed to add contact/i)).toBeInTheDocument());
  });
});
