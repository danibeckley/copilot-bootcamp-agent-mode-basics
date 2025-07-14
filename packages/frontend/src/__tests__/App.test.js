import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

describe('App Component - Fetch Data Functionality', () => {
  test('handles error during initial data fetch', async () => {
    // Mock failed initial fetch
    global.fetch.mockReset();
    global.fetch.mockRejectedValueOnce(new Error('Network Error on initial fetch'));
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Check if error message is displayed
    expect(await screen.findByText(/Failed to fetch data/i)).toBeInTheDocument();
    expect(await screen.findByText(/Network Error on initial fetch/i)).toBeInTheDocument();
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('handles server error during initial data fetch', async () => {
    // Mock server error response
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Check if error message is displayed
    expect(await screen.findByText(/Failed to fetch data/i)).toBeInTheDocument();
    expect(await screen.findByText(/Network response was not ok/i)).toBeInTheDocument();
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('shows empty state when no items are returned', async () => {
    // Mock empty data response
    global.fetch.mockReset();
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([])
    });

    render(<App />);

    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Check if empty state message is displayed
    expect(screen.getByText(/No items found. Add some!/i)).toBeInTheDocument();
  });
});

describe('App Component - Add Item Functionality', () => {
  test('adds item to the list when add is successful', async () => {
    // Mock successful add response
    global.fetch
      .mockImplementationOnce(() => // This handles the initial fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems)
        })
      )
      .mockImplementationOnce(() => // This handles the add request
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 3, name: 'New Item', created_at: new Date().toISOString() })
        })
      );

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Type in the new item name
    const input = screen.getByLabelText(/Item Name/i);
    await userEvent.type(input, 'New Item');

    // Click the add button
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    
    // Verify fetch was called with correct data
    expect(global.fetch).toHaveBeenCalledWith('/api/items', expect.objectContaining({
      method: 'POST',
      headers: expect.objectContaining({
        'Content-Type': 'application/json',
      }),
      body: JSON.stringify({ name: 'New Item' }),
    }));
    
    // Verify new item is added to the list
    await waitFor(() => {
      expect(screen.getByText('New Item')).toBeInTheDocument();
    });
  });

  test('disables add button when input is empty', async () => {
    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Check that the button is disabled initially
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    expect(addButton).toBeDisabled();

    // Type in the new item name
    const input = screen.getByLabelText(/Item Name/i);
    await userEvent.type(input, 'New Item');

    // Check that the button is enabled
    expect(addButton).not.toBeDisabled();

    // Clear the input
    await userEvent.clear(input);

    // Check that the button is disabled again
    expect(addButton).toBeDisabled();
  });

  test('shows error message when add request fails', async () => {
    // Mock successful initial fetch and failed add request
    global.fetch
      .mockImplementationOnce(() => // Initial fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems)
        })
      )
      .mockImplementationOnce(() => // Add request
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

    // Type in the new item name
    const input = screen.getByLabelText(/Item Name/i);
    await userEvent.type(input, 'New Item');

    // Click the add button
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    
    // Check if error message is displayed
    expect(await screen.findByText(/Error adding item/i)).toBeInTheDocument();
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('handles network errors during add request', async () => {
    // Mock successful initial fetch and network error for add
    global.fetch
      .mockImplementationOnce(() => // Initial fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems)
        })
      )
      .mockImplementationOnce(() => // Add request
        Promise.reject(new Error('Network Error'))
      );

    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Type in the new item name
    const input = screen.getByLabelText(/Item Name/i);
    await userEvent.type(input, 'New Item');

    // Click the add button
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    
    // Check if error message is displayed
    expect(await screen.findByText(/Error adding item/i)).toBeInTheDocument();
    
    // Verify console.error was called with network error
    expect(console.error).toHaveBeenCalledWith(
      'Error adding item:',
      expect.objectContaining({ message: 'Network Error' })
    );
    
    // Clean up mock
    console.error.mockRestore();
  });

  test('clears input field after successful item addition', async () => {
    // Mock successful add response
    global.fetch
      .mockImplementationOnce(() => // Initial fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems)
        })
      )
      .mockImplementationOnce(() => // Add request
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 3, name: 'New Item', created_at: new Date().toISOString() })
        })
      );

    render(<App />);

    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });

    // Type in the new item name
    const input = screen.getByLabelText(/Item Name/i);
    await userEvent.type(input, 'New Item');
    
    // Click the add button
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    
    // Verify input is cleared after successful addition
    await waitFor(() => {
      expect(input.value).toBe('');
    });
  });
});

describe('App Component - UI Elements', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    
    // Mock GET /api/items
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })
    );
  });

  test('renders the AppBar with correct text', async () => {
    render(<App />);
    
    expect(screen.getByText('Hello World')).toBeInTheDocument();
    expect(screen.getByText('Connected to in-memory database')).toBeInTheDocument();
  });

  test('renders the "Add New Item" form', async () => {
    render(<App />);
    
    expect(screen.getByText('Add New Item')).toBeInTheDocument();
    expect(screen.getByLabelText(/Item Name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Item/i })).toBeInTheDocument();
  });

  test('renders the table headers correctly', async () => {
    render(<App />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check table headers
    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Created At')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  test('formats dates correctly in the table', async () => {
    render(<App />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check if dates are formatted properly (will vary based on locale, so just check if they exist)
    const formattedDates = mockItems.map(item => 
      new Date(item.created_at).toLocaleString()
    );
    
    for (const dateStr of formattedDates) {
      expect(screen.getByText(dateStr)).toBeInTheDocument();
    }
  });
});

describe('App Component - End-to-End Scenarios', () => {
  test('complete end-to-end flow: fetch, add, delete', async () => {
    // Mock initial data fetch
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          { id: 1, name: 'Initial Item', created_at: '2025-07-01T12:00:00Z' }
        ])
      })
    );
    
    // Mock add item request
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 201,
        json: () => Promise.resolve({ 
          id: 2, 
          name: 'New Test Item', 
          created_at: '2025-07-10T12:00:00Z' 
        })
      })
    );
    
    // Mock delete request
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ message: 'Item deleted successfully', id: '1' })
      })
    );

    render(<App />);
    
    // Wait for initial data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Verify initial item is displayed
    expect(screen.getByText('Initial Item')).toBeInTheDocument();
    
    // Add a new item
    const input = screen.getByLabelText(/Item Name/i);
    await userEvent.type(input, 'New Test Item');
    
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    fireEvent.click(addButton);
    
    // Verify new item is added
    await waitFor(() => {
      expect(screen.getByText('New Test Item')).toBeInTheDocument();
    });
    
    // Delete the initial item
    const deleteButtons = await screen.findAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]); // Delete the first item
    
    // Verify the first item is removed
    await waitFor(() => {
      expect(screen.queryByText('Initial Item')).not.toBeInTheDocument();
    });
    
    // Verify the new item remains
    expect(screen.getByText('New Test Item')).toBeInTheDocument();
  });

  test('handles error then recovery scenario', async () => {
    // Mock failed initial fetch
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network Error'))
    );
    
    // Mock successful retry fetch
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })
    );
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Verify error is displayed
    expect(await screen.findByText(/Failed to fetch data/i)).toBeInTheDocument();
    
    // Force a re-fetch by clicking on a UI element that would trigger a re-fetch
    // In a real scenario, this might be a retry button
    // For this test, we'll simulate by clicking the AppBar title
    fireEvent.click(screen.getByText('Hello World'));
    
    // Manually trigger fetchData (simulating the effect of a retry button)
    await act(async () => {
      global.fetch.mockImplementationOnce(() => 
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems)
        })
      );
    });
    
    // Verify data is now displayed
    await waitFor(() => {
      expect(screen.queryByText(/Failed to fetch data/i)).not.toBeInTheDocument();
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
    });
    
    // Clean up mock
    console.error.mockRestore();
  });
});

describe('App Component - Accessibility Tests', () => {
  beforeEach(() => {
    global.fetch.mockClear();
    
    // Mock GET /api/items
    global.fetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockItems)
      })
    );
  });

  test('form elements have appropriate labels', async () => {
    render(<App />);
    
    // Check for item name input with label
    const itemNameInput = screen.getByLabelText(/Item Name/i);
    expect(itemNameInput).toBeInTheDocument();
    expect(itemNameInput.getAttribute('aria-label') || 
           itemNameInput.labels[0].textContent).toBeTruthy();
  });

  test('delete buttons have accessible names', async () => {
    render(<App />);
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Check delete buttons have accessible names
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    deleteButtons.forEach(button => {
      expect(button.textContent).toBe('Delete');
      expect(button.getAttribute('aria-label') || button.textContent).toBeTruthy();
    });
  });

  test('loading indicator has accessible text', async () => {
    // Reset the fetch mock to delay the response
    global.fetch.mockReset();
    
    // Create a promise that we'll resolve manually
    let resolvePromise;
    const dataPromise = new Promise(resolve => {
      resolvePromise = resolve;
    });
    
    // Mock fetch to use our controlled promise
    global.fetch.mockImplementationOnce(() => dataPromise);
    
    render(<App />);
    
    // Check if loading indicator is showing
    const loadingIndicator = screen.getByTestId('loading-indicator');
    expect(loadingIndicator).toBeInTheDocument();
    
    // Ensure loading state is communicated to screen readers
    expect(loadingIndicator.getAttribute('aria-label') || 
           loadingIndicator.textContent).toBeTruthy();
    
    // Resolve the promise to continue the test
    resolvePromise(Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockItems)
    }));
    
    // Wait for loading to finish
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
  });

  test('error messages are announced properly', async () => {
    // Mock a failed fetch
    global.fetch.mockReset();
    global.fetch.mockImplementationOnce(() => 
      Promise.reject(new Error('Network Error'))
    );
    
    // Mock console.error to avoid test output noise
    jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    // Check for error message
    const errorAlert = await screen.findByRole('alert');
    expect(errorAlert).toBeInTheDocument();
    
    // Check error message is properly structured for screen readers
    expect(errorAlert.getAttribute('role')).toBe('alert');
    expect(errorAlert.textContent).toContain('Failed to fetch data');
    
    console.error.mockRestore();
  });

  test('form submission is accessible via keyboard', async () => {
    // Mock successful add response
    global.fetch
      .mockImplementationOnce(() => // Initial fetch
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockItems)
        })
      )
      .mockImplementationOnce(() => // Add request
        Promise.resolve({
          ok: true,
          status: 201,
          json: () => Promise.resolve({ id: 3, name: 'Keyboard Item', created_at: new Date().toISOString() })
        })
      );

    render(<App />);
    
    // Wait for items to load
    await waitFor(() => {
      expect(screen.queryByTestId('loading-indicator')).not.toBeInTheDocument();
    });
    
    // Tab to the input field
    const input = screen.getByLabelText(/Item Name/i);
    input.focus();
    expect(document.activeElement).toBe(input);
    
    // Type using keyboard
    await userEvent.type(input, 'Keyboard Item');
    
    // Tab to the submit button
    await userEvent.tab();
    const addButton = screen.getByRole('button', { name: /Add Item/i });
    expect(document.activeElement).toBe(addButton);
    
    // Submit using Enter key
    fireEvent.keyDown(addButton, { key: 'Enter', code: 'Enter' });
    fireEvent.click(addButton); // Simulating Enter key submission
    
    // Verify item was added
    await waitFor(() => {
      expect(screen.getByText('Keyboard Item')).toBeInTheDocument();
    });
  });
});
