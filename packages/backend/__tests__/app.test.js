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

describe('GET /api/items', () => {
  beforeEach(() => {
    // Clear the items table
    db.exec('DELETE FROM items');
    
    // Insert test items with known dates
    const insertStmt = db.prepare('INSERT INTO items (name, created_at) VALUES (?, ?)');
    const now = new Date();
    
    insertStmt.run('Item 1', new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString()); // 7 days ago
    insertStmt.run('Item 2', new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString()); // 3 days ago
  });

  it('should return all items in descending order by created_at', async () => {
    const response = await request(app)
      .get('/api/items')
      .expect(200);
    
    // Check response is an array with 2 items
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    
    // Check they're in descending order by created_at
    expect(response.body[0].name).toBe('Item 2'); // Most recent first
    expect(response.body[1].name).toBe('Item 1');
  });

  it('should handle database errors when fetching items', async () => {
    // Mock a database error by temporarily replacing the prepare method
    const originalPrepare = db.prepare;
    db.prepare = jest.fn(() => {
      throw new Error('Database error during fetch');
    });
    
    const response = await request(app)
      .get('/api/items')
      .expect(500);
    
    // Check the error response
    expect(response.body).toHaveProperty('error', 'Failed to fetch items');
    
    // Restore original prepare method
    db.prepare = originalPrepare;
  });
});

describe('POST /api/items', () => {
  beforeEach(() => {
    // Clear the items table
    db.exec('DELETE FROM items');
  });

  it('should create a new item with valid data', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'New Test Item' })
      .expect(201);
    
    // Check the response has the expected properties
    expect(response.body).toHaveProperty('id');
    expect(response.body.name).toBe('New Test Item');
    expect(response.body).toHaveProperty('created_at');
    
    // Verify the item was actually inserted in the database
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(response.body.id);
    expect(item).toBeDefined();
    expect(item.name).toBe('New Test Item');
  });

  it('should return 400 when item name is missing', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({})
      .expect(400);
    
    expect(response.body).toHaveProperty('error', 'Item name is required');
  });

  it('should return 400 when item name is empty', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: '' })
      .expect(400);
    
    expect(response.body).toHaveProperty('error', 'Item name is required');
  });

  it('should return 400 when item name is not a string', async () => {
    const response = await request(app)
      .post('/api/items')
      .send({ name: 123 })
      .expect(400);
    
    expect(response.body).toHaveProperty('error', 'Item name is required');
  });

  it('should handle database errors when creating an item', async () => {
    // Save the original insertStmt for restoration
    const { insertStmt } = require('../src/app');
    const originalRun = insertStmt.run;
    
    // Mock a database error
    insertStmt.run = jest.fn(() => {
      throw new Error('Database error during insert');
    });
    
    const response = await request(app)
      .post('/api/items')
      .send({ name: 'Test Item' })
      .expect(500);
    
    // Check error response
    expect(response.body).toHaveProperty('error', 'Failed to create item');
    
    // Restore original function
    insertStmt.run = originalRun;
  });
});

describe('DELETE /api/items/:id - Extended Tests', () => {
  beforeEach(() => {
    // Clear the items table
    db.exec('DELETE FROM items');
    
    // Insert test items with specific created_at dates
    const insertWithDateStmt = db.prepare('INSERT INTO items (name, created_at) VALUES (?, ?)');
    
    // Create items with exactly 5 days age (edge case)
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);
    insertWithDateStmt.run('Five Days Old Item', fiveDaysAgo.toISOString());
    
    // Create an item with 4 days and 23 hours age (just under threshold)
    const almostFiveDaysAgo = new Date();
    almostFiveDaysAgo.setDate(almostFiveDaysAgo.getDate() - 4);
    almostFiveDaysAgo.setHours(almostFiveDaysAgo.getHours() - 23);
    insertWithDateStmt.run('Almost Five Days Old Item', almostFiveDaysAgo.toISOString());
    
    // Create an item with invalid date format
    insertWithDateStmt.run('Invalid Date Item', 'not-a-valid-date');
  });

  it('should allow deletion of items exactly 5 days old', async () => {
    // Get the exactly 5-day-old item from the database
    const item = db.prepare("SELECT * FROM items WHERE name = 'Five Days Old Item'").get();
    
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

  it('should not allow deletion of items just under 5 days old', async () => {
    // Get the almost 5-day-old item from the database
    const item = db.prepare("SELECT * FROM items WHERE name = 'Almost Five Days Old Item'").get();
    
    // Send a DELETE request for the item
    const response = await request(app)
      .delete(`/api/items/${item.id}`)
      .expect(403);
    
    // Assert the response contains the expected error message
    expect(response.body).toHaveProperty('error', 'Cannot delete items newer than 5 days');
    
    // Verify the item is still in the database
    const checkItem = db.prepare('SELECT * FROM items WHERE id = ?').get(item.id);
    expect(checkItem).toBeDefined();
  });

  it('should handle invalid date formats gracefully', async () => {
    // Get the item with invalid date from the database
    const item = db.prepare("SELECT * FROM items WHERE name = 'Invalid Date Item'").get();
    
    // Send a DELETE request for the item
    const response = await request(app)
      .delete(`/api/items/${item.id}`)
      .expect(500);
    
    // Assert the response contains an error message
    expect(response.body).toHaveProperty('error', 'Failed to delete item');
  });

  it('should handle malformed IDs gracefully', async () => {
    // Send a DELETE request with a malformed ID
    const response = await request(app)
      .delete('/api/items/not-a-number')
      .expect(500);
    
    // Assert the response contains an error message
    expect(response.body).toHaveProperty('error', 'Failed to delete item');
  });

  it('should handle empty string ID', async () => {
    // Send a DELETE request with an empty string ID
    const response = await request(app)
      .delete('/api/items/ ')
      .expect(400);
    
    // Assert the response contains an error message
    expect(response.body).toHaveProperty('error', 'Item id is required');
  });
});

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Clear the items table
    db.exec('DELETE FROM items');
  });

  it('should support a complete CRUD flow', async () => {
    // 1. First create a new item
    const createResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Integration Test Item' })
      .expect(201);
    
    const newItemId = createResponse.body.id;
    expect(newItemId).toBeDefined();
    
    // 2. Verify it appears in the GET all items endpoint
    const getAllResponse = await request(app)
      .get('/api/items')
      .expect(200);
    
    expect(Array.isArray(getAllResponse.body)).toBe(true);
    expect(getAllResponse.body.some(item => item.id === newItemId)).toBe(true);
    expect(getAllResponse.body.find(item => item.id === newItemId).name).toBe('Integration Test Item');
    
    // 3. Try to delete the item (should fail if it's too new)
    const deleteResponse = await request(app)
      .delete(`/api/items/${newItemId}`)
      .expect(403); // Should be forbidden since it's just created
    
    expect(deleteResponse.body).toHaveProperty('error', 'Cannot delete items newer than 5 days');
    
    // 4. Manipulate the database to make the item older
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 6);
    
    db.prepare('UPDATE items SET created_at = ? WHERE id = ?')
      .run(fiveDaysAgo.toISOString(), newItemId);
    
    // 5. Now try to delete again (should succeed)
    const successDeleteResponse = await request(app)
      .delete(`/api/items/${newItemId}`)
      .expect(200);
    
    expect(successDeleteResponse.body).toHaveProperty('message', 'Item deleted successfully');
    
    // 6. Verify it's gone from the database
    const finalGetResponse = await request(app)
      .get('/api/items')
      .expect(200);
    
    expect(finalGetResponse.body.some(item => item.id === newItemId)).toBe(false);
  });

  it('should enforce data integrity constraints across operations', async () => {
    // 1. Try to create items with the same name
    await request(app)
      .post('/api/items')
      .send({ name: 'Duplicate Item' })
      .expect(201);
    
    // Create another with the same name (should still work as we don't have uniqueness constraints)
    await request(app)
      .post('/api/items')
      .send({ name: 'Duplicate Item' })
      .expect(201);
    
    // 2. Verify both items exist but have different IDs
    const getResponse = await request(app)
      .get('/api/items')
      .expect(200);
    
    const duplicateItems = getResponse.body.filter(item => item.name === 'Duplicate Item');
    expect(duplicateItems.length).toBe(2);
    expect(duplicateItems[0].id).not.toBe(duplicateItems[1].id);
    
    // 3. Try deleting with invalid ID formats
    await request(app)
      .delete('/api/items/invalid-id')
      .expect(500);
    
    await request(app)
      .delete('/api/items/999999')  // Non-existent ID
      .expect(404);
    
    // 4. Verify original items are still intact
    const finalGetResponse = await request(app)
      .get('/api/items')
      .expect(200);
    
    expect(finalGetResponse.body.filter(item => item.name === 'Duplicate Item').length).toBe(2);
  });

  it('should handle error recovery scenarios', async () => {
    // 1. Create an item that we'll use for testing
    const createResponse = await request(app)
      .post('/api/items')
      .send({ name: 'Recovery Test Item' })
      .expect(201);
    
    const itemId = createResponse.body.id;
    
    // 2. Make the item old enough to delete
    const sixDaysAgo = new Date();
    sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
    db.prepare('UPDATE items SET created_at = ? WHERE id = ?')
      .run(sixDaysAgo.toISOString(), itemId);
    
    // 3. Temporarily corrupt the database to simulate an error
    const originalPrepare = db.prepare;
    db.prepare = jest.fn(() => {
      throw new Error('Simulated database error');
    });
    
    // 4. Try to delete while database is "corrupted"
    await request(app)
      .delete(`/api/items/${itemId}`)
      .expect(500);
    
    // 5. Restore database functionality
    db.prepare = originalPrepare;
    
    // 6. Try again - should succeed now
    const deleteResponse = await request(app)
      .delete(`/api/items/${itemId}`)
      .expect(200);
    
    expect(deleteResponse.body).toHaveProperty('message', 'Item deleted successfully');
    
    // 7. Verify item is gone
    const getResponse = await request(app)
      .get('/api/items')
      .expect(200);
    
    expect(getResponse.body.some(item => item.id === itemId)).toBe(false);
  });
});
