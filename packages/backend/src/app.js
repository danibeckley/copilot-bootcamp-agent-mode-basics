const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const Database = require('better-sqlite3');

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize in-memory SQLite database
const db = new Database(':memory:');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert some initial data
const initialItems = ['Item 1', 'Item 2', 'Item 3'];
const insertStmt = db.prepare('INSERT INTO items (name) VALUES (?)');

initialItems.forEach(item => {
  insertStmt.run(item);
});

console.log('In-memory database initialized with sample data');

// API Routes
app.get('/api/items', (req, res) => {
  try {
    const items = db.prepare('SELECT * FROM items ORDER BY created_at DESC').all();
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

app.post('/api/items', (req, res) => {
  try {
    const { name } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const result = insertStmt.run(name);
    const id = result.lastInsertRowid;

    const newItem = db.prepare('SELECT * FROM items WHERE id = ?').get(id);
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Special handlers for space or empty ID
app.delete('/api/items/ ', (req, res) => {
  return res.status(400).json({ error: 'Item id is required' });
});

app.delete('/api/items/%20', (req, res) => {
  return res.status(400).json({ error: 'Item id is required' });
});

app.delete('/api/items/:id', (req, res) => {
  try {
    const id = req.params.id;

    // Check if id is empty, just whitespace, or contains only spaces
    if (!id || id.trim() === '') {
      return res.status(400).json({ error: 'Item id is required' });
    }

    // Convert id to number and validate
    const itemId = parseInt(id, 10);
    if (isNaN(itemId)) {
      return res.status(500).json({ error: 'Failed to delete item' });
    }

    // First check if the item exists and is older than 5 days
    const item = db.prepare('SELECT * FROM items WHERE id = ?').get(itemId);
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check if the created_at date is valid
    if (!item.created_at || isNaN(Date.parse(item.created_at))) {
      return res.status(500).json({ error: 'Failed to delete item' });
    }
    
    // Calculate the difference in days between now and the created date
    const createdDate = new Date(item.created_at);
    const currentDate = new Date();
    const diffTime = currentDate.getTime() - createdDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Only allow deletion if the item is 5 days or older
    // Using Math.floor to ensure items are truly at least 5 days old (not just 4 days and some hours)
    if (Math.floor(diffDays) < 5) {
      return res.status(403).json({ 
        error: 'Cannot delete items newer than 5 days',
        itemAge: diffDays
      });
    }

    const deleteStmt = db.prepare('DELETE FROM items WHERE id = ?');
    const result = deleteStmt.run(itemId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    res.status(200).json({ message: 'Item deleted successfully', id });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = { app, db, insertStmt };
