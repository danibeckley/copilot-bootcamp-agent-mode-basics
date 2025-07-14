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
    
    // Insert test items with specific created_at dates
    const insertWithDateStmt = db.prepare('INSERT INTO items (name, created_at) VALUES (?, ?)');
    
    // Create an item older than 5 days
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 6);
    insertWithDateStmt.run('Old Item', oldDate.toISOString());
    
    // Create a recent item (less than 5 days old)
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    insertWithDateStmt.run('Recent Item', recentDate.toISOString());
  });

  it('should successfully delete an item older than 5 days', async () => {
    // Get the old item from the database
    const item = db.prepare("SELECT * FROM items WHERE name = 'Old Item'").get();
    
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

  it('should return 403 when trying to delete an item less than 5 days old', async () => {
    // Get the recent item from the database
    const item = db.prepare("SELECT * FROM items WHERE name = 'Recent Item'").get();
    
    // Send a DELETE request for the recent item
    const response = await request(app)
      .delete(`/api/items/${item.id}`)
      .expect(403);
    
    // Assert the response contains the expected error message
    expect(response.body).toHaveProperty('error', 'Cannot delete items newer than 5 days');
    
    // Check that itemAge is a number less than 5
    expect(response.body).toHaveProperty('itemAge');
    expect(typeof response.body.itemAge).toBe('number');
    expect(response.body.itemAge).toBeLessThan(5);
    
    // Verify the item is still in the database
    const checkItem = db.prepare('SELECT * FROM items WHERE id = ?').get(item.id);
    expect(checkItem).toBeDefined();
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
