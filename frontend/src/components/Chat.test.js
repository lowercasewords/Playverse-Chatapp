import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Chat from './Chat';
import io from 'socket.io-client';
import contactService from '../services/contactService';
import messageService from '../services/messageService';

// --- Mock socket.io-client ---
jest.mock('socket.io-client', () => {
  return jest.fn(() => ({
    on: jest.fn(),
    emit: jest.fn(),
    off: jest.fn(),
    disconnect: jest.fn(),
  }));
});

// --- Mock contactService ---
jest.mock('../services/contactService', () => ({
  __esModule: true,
  default: {
    getContacts: jest.fn(),
  },
}));

// --- Mock messageService ---
jest.mock('../services/messageService', () => ({
  __esModule: true,
  default: {
    getMessagesBetweenUsers: jest.fn().mockResolvedValue({
      messages: [
        {
          _id: 'msg1',
          sender: 'test-user-id',
          receiver: 'contact1',
          content: 'Hello',
          createdAt: '2020-01-01T00:00:00.000Z',
        },
        {
          _id: 'msg2',
          sender: 'contact1',
          receiver: 'test-user-id',
          content: 'Hi!',
          createdAt: '2020-01-01T00:01:00.000Z',
        },
      ],
    }),
    clearChat: jest.fn().mockResolvedValue({ message: "Chat cleared successfully" }),
  },
}));

describe('Chat Component Tests', () => {
  beforeEach(() => {
    localStorage.setItem('userId', 'test-user-id');
    // For the test case with defined contacts, return an object with a contacts array
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

  it('renders initial Chat component with prompt when contacts are defined', async () => {
    render(<Chat />);
    // Expect initial prompt to be shown
    expect(screen.getByText(/Select a contact to start messaging/i)).toBeInTheDocument();

    // Wait for contacts to load and appear
    await waitFor(() =>
      expect(screen.getByText('contact1@example.com')).toBeInTheDocument()
    );
    expect(screen.getByText('contact2@example.com')).toBeInTheDocument();
  });

  it('renders Chat component and displays prompt when contacts are undefined', async () => {
    // Override the mock for getContacts to return an empty object instead of undefined
    contactService.getContacts.mockResolvedValue({});
    render(<Chat />);
    // The initial prompt should still be displayed
    expect(screen.getByText(/Select a contact to start messaging/i)).toBeInTheDocument();
    // No contact emails should appear
    expect(screen.queryByText('contact1@example.com')).toBeNull();
    expect(screen.queryByText('contact2@example.com')).toBeNull();
  });
});
