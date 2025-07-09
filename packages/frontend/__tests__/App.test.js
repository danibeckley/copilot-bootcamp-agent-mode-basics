import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import App from '../src/App';

// Mock data for testing
const mockItems = [
  { id: 1, name: 'Item 1', created_at: '2025-07-09T12:00:00Z' },
  { id: 2, name: 'Item 2', created_at: '2025-07-09T12:30:00Z' },
];

// Set up MSW server to intercept API requests
const server = setupServer(
  // GET items
  rest.get('/api/items', (req, res, ctx) => {
    return res(ctx.json(mockItems));
  }),

  // DELETE item
  rest.delete('/api/items/:id', (req, res, ctx) => {
    const { id } = req.params;
    // Return a successful response for delete
    return res(ctx.status(200));
  })
);

// Set up and tear down the server before and after tests
beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('App Component - Delete Functionality', () => {
  test('renders delete buttons for each item', async () => {
    render(<App />);

    // Wait for the items to be loaded
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Check if delete buttons are rendered
    const deleteButtons = screen.getAllByText('Delete');
    expect(deleteButtons).toHaveLength(mockItems.length);
  });

  test('removes item from the list when delete is successful', async () => {
    render(<App />);

    // Wait for the items to be loaded
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Verify item exists before deletion
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    
    // Find and click delete button for the first item
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
    
    // Verify item is removed after deletion
    await waitFor(() => {
      expect(screen.queryByText('Item 1')).not.toBeInTheDocument();
    });
    
    // Verify the other item still exists
    expect(screen.getByText('Item 2')).toBeInTheDocument();
  });

  test('shows error message when delete request fails', async () => {
    // Override the DELETE handler to simulate a failure
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    render(<App />);

    // Wait for the items to be loaded
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Find and click delete button for the first item
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[0]);
    
    // Check if error message is displayed
    await waitFor(() => {
      expect(screen.getByText(/error deleting item/i)).toBeInTheDocument();
    });
    
    // Verify the item still exists in the list
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  test('correctly identifies which item to delete', async () => {
    // Create a mock function to track which ID is being deleted
    const mockDeleteHandler = jest.fn();
    server.use(
      rest.delete('/api/items/:id', (req, res, ctx) => {
        const { id } = req.params;
        mockDeleteHandler(Number(id));
        return res(ctx.status(200));
      })
    );

    render(<App />);

    // Wait for the items to be loaded
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });
    
    // Find and click delete button for the second item
    const deleteButtons = screen.getAllByText('Delete');
    await userEvent.click(deleteButtons[1]);
    
    // Verify correct ID was passed to delete endpoint
    expect(mockDeleteHandler).toHaveBeenCalledWith(2);
    
    // Verify the second item is removed after deletion
    await waitFor(() => {
      expect(screen.queryByText('Item 2')).not.toBeInTheDocument();
    });
    
    // Verify the first item still exists
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });
});
