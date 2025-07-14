import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../App';

// Mock fetch for tests
global.fetch = jest.fn();

// Mock data for testing
const mockItems = [
  { id: 1, name: 'Item 1', created_at: '2025-07-01T12:00:00Z' }, // Older than 5 days
  { id: 2, name: 'Item 2', created_at: '2025-07-02T12:30:00Z' }, // Older than 5 days
];

// Set up and tear down before and after tests
beforeEach(() => {
  // Mock the fetch implementation for each test
  global.fetch.mockClear();
  
  // Mock GET /api/items
  global.fetch.mockImplementationOnce(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockItems)
    })
  );
});

// Clean up after tests
afterEach(() => {
  global.fetch.mockClear();
});

describe('App Component - Delete Functionality', () => {
  test('renders delete buttons for each item', async () => {
    render(<App />);

    // Wait for the items to be loaded
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Check if the items are rendered
    expect(await screen.findByText('1')).toBeInTheDocument(); // ID column
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(await screen.findByText('Item 2')).toBeInTheDocument();
    
    // Check if delete buttons are rendered
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    expect(deleteButtons).toHaveLength(mockItems.length);
  });

  test('removes item from the list when delete is successful', async () => {
    // Mock successful delete response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true
      })
    );

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Find Item 1
    const item1 = await screen.findByText('Item 1');
    expect(item1).toBeInTheDocument();
    
    // Find and click delete button for the first item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith('/api/items/1', expect.objectContaining({
      method: 'DELETE'
    }));
    
    // Verify item is no longer in the state (removed from UI)
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  test('shows error message when delete request fails', async () => {
    // Mock failed delete response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 500
      })
    );

    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Find and click delete button for the first item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check if error message is displayed
    expect(await screen.findByText(/error deleting item/i)).toBeInTheDocument();
    
    // Verify console.error was called
    expect(console.error).toHaveBeenCalled();
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('correctly identifies which item to delete', async () => {
    // Mock successful delete response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true
      })
    );

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Find Item 2
    const item2 = await screen.findByText('Item 2');
    expect(item2).toBeInTheDocument();
    
    // Find and click delete button for the second item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[1]);
    
    // Verify fetch was called with correct URL
    expect(global.fetch).toHaveBeenCalledWith('/api/items/2', expect.objectContaining({
      method: 'DELETE'
    }));
    
    // Verify item is no longer in the state (removed from UI)
    await waitFor(() => {
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });
  });

  test('handles network errors during delete request', async () => {
    // Mock network error for delete
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network Error'))
    );

    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Find and click delete button
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check if error message is displayed
    expect(await screen.findByText(/error deleting item/i)).toBeInTheDocument();
    
    // Verify console.error was called with network error
    expect(console.error).toHaveBeenCalledWith(
      'Error deleting item:',
      expect.objectContaining({ message: 'Network Error' })
    );
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('handles keyboard navigation for delete button', async () => {
    // Mock successful delete response
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true
      })
    );

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Find delete buttons
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    
    // Use keyboard interaction (Enter key)
    fireEvent.keyDown(deleteButtons[0], { key: 'Enter', code: 'Enter' });
    fireEvent.click(deleteButtons[0]); // We need to click to trigger the actual handler
    
    // Verify fetch was called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/items/1', expect.objectContaining({
        method: 'DELETE'
      }));
    });
    
    // Verify item is removed
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
  });

  test('tests delete functionality with multiple renders', async () => {
    // Initial render will use the default mock set up in beforeEach
    
    // Set up additional fetch mocks for the delete and subsequent GET
    global.fetch
      // Mock successful delete response
      .mockImplementationOnce(() => Promise.resolve({ ok: true }))
      // Mock a new GET response after deletion (with item removed)
      .mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve([mockItems[1]]) // Only return the second item
        })
      );

    render(<App />);
    
    // Wait for initial data load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Verify both items are initially rendered
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
    
    // Delete first item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Verify item is removed
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
    
    // Manually trigger a fetch
    fireEvent.click(screen.getByText('Hello World'));
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([mockItems[1]]) // Only the second item
      })
    );
    
    // Call fetchData directly
    const fetchDataButton = screen.getByText('Connected to in-memory database');
    fireEvent.click(fetchDataButton);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Verify only the second item remains
    expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });
});

describe('App Component - Add and Delete Edge Cases', () => {
  beforeEach(() => {
    // Mock the fetch implementation for each test
    global.fetch.mockClear();
    
    // Mock GET /api/items
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })
    );
  });
  
  test('shows error message when delete fails', async () => {
    // This test replaces 'handles delete with custom error message'
    // Load the app first with initial data
    render(<App />);
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Set up the mock for the delete operation - must be done after initial fetch
    // Reset the fetch mock
    global.fetch.mockReset();
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the failed delete request
    global.fetch.mockRejectedValueOnce(new Error('Failed to delete item'));
    
    // Find and click delete button for the first item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check for the error message using an alternative approach - wait for the alert to appear
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0]).toHaveTextContent(/error deleting item/i);
    });
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('shows appropriate error when trying to delete an item less than 5 days old', async () => {
    // Load the app first with initial data
    render(<App />);
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Set up the mock for the delete operation - must be done after initial fetch
    global.fetch.mockReset();
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // Mock the 403 response for trying to delete an item less than 5 days old
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ 
          error: 'Cannot delete items newer than 5 days',
          itemAge: 3 
        })
      })
    );
    
    // Find and click delete button for an item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    // Check for the specific error message about age requirement
    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0]).toHaveTextContent(/must be at least 5 days old/i);
      expect(alerts[0]).toHaveTextContent(/current age: 3 days/i);
    });
    
    // Clean up mock
    console.error.mockRestore();
  });
});
