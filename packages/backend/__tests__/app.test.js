/**
 * Unit tests for the Express app routes
 * 
 * This file contains tests for the API endpoints defined in app.js
 * with a focus on the item deletion functionality
 */

const request = require('supertest');
const { app, db } = require('../src/app');

describe('DELETE /api/items/:id', () => {
  // Create some test data before each test
  beforeEach(() => {
    // Clear the items table
    db.exec('DELETE FROM items');
    
    // Insert test items
    const insertStmt = db.prepare('INSERT INTO items (name) VALUES (?)');
    insertStmt.run('Test Item 1');
    insertStmt.run('Test Item 2');
  });

  it('should successfully delete an existing item', async () => {
    // Get an existing item from the database
    const item = db.prepare('SELECT * FROM items LIMIT 1').get();
    
    // Send a DELETE request to remove the item
    const response = await request(app)
      .delete(`/api/items/${item.id}`)
      .expect(200);
    
    // Assert the response contains the expected message and ID
    expect(response.body).toHaveProperty('message', 'Item deleted successfully');
    expect(response.body).toHaveProperty('id', item.id.toString());
    
    // Verify the item is actually deleted from the database
    const checkItem = db.prepare('SELECT * FROM items WHERE id = ?').get(item.id);
    expect(checkItem).toBeUndefined();
  });

  it('should return 404 when deleting a non-existent item', async () => {
    // Use a non-existent ID
    const nonExistentId = 9999;
    
    // Send a DELETE request with the non-existent ID
    const response = await request(app)
      .delete(`/api/items/${nonExistentId}`)
      .expect(404);
    
    // Assert the response contains the expected error message
    expect(response.body).toHaveProperty('error', 'Item not found');
  });

  it('should return 400 when no ID is provided', async () => {
    // Send a DELETE request with no ID
    const response = await request(app)
      .delete('/api/items/')
      .expect(404); // Express returns 404 for unmatched routes
  });

  it('should handle database errors gracefully', async () => {
    // Get an existing item from the database
    const item = db.prepare('SELECT * FROM items LIMIT 1').get();
    
    // Mock a database error by temporarily replacing the prepare method
    const originalPrepare = db.prepare;
    db.prepare = jest.fn(() => {
      throw new Error('Database error');
    });
    
    // Send a DELETE request
    const response = await request(app)
      .delete(`/api/items/${item.id}`)
      .expect(500);
    
    // Assert the response contains the expected error message
    expect(response.body).toHaveProperty('error', 'Failed to delete item');
    
    // Restore the original prepare method
    db.prepare = originalPrepare;
  });
});
