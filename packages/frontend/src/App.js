import React, { useState, useEffect } from 'react';
// Import Material-UI components
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Button, 
  TextField,
  Typography,
  Box,
  Container,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setError(null); // Clear any previous errors
      setLoading(true);
      const response = await fetch('/api/items');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      setError(null);
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newItem }),
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      const result = await response.json();
      setData(prevData => [...prevData, result]);
      setNewItem('');
    } catch (err) {
      setError('Error adding item: ' + err.message);
      console.error('Error adding item:', err);
    }
  };

  const handleDelete = async id => {
    try {
      setError(null);
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        // Check if it's the "too recent to delete" error
        const errorData = await response.json();
        if (response.status === 403 && errorData.error === 'Cannot delete items newer than 5 days') {
          throw new Error(`Cannot delete: item must be at least 5 days old (current age: ${errorData.itemAge} days)`);
        }
        throw new Error('Failed to delete item');
      }

      // Remove the deleted item from state
      setData(prevData => prevData.filter(item => item.id !== id));
    } catch (err) {
      setError('Error deleting item: ' + err.message);
      console.error('Error deleting item:', err);
    }
  };

  return (
    <div className="App">
      <Box sx={{ flexGrow: 1, mb: 4 }}>
        <AppBar position="static" color="primary">
          <Toolbar>
            <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
              Hello World
            </Typography>
            <Typography variant="subtitle1">Connected to in-memory database</Typography>
          </Toolbar>
        </AppBar>
      </Box>

      <Container maxWidth="lg">
        <Box my={4}>
          <Box component={Paper} p={3} mb={4} elevation={2}>
            <Typography variant="h6" gutterBottom>Add New Item</Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                variant="outlined"
                value={newItem}
                onChange={e => setNewItem(e.target.value)}
                placeholder="Enter item name"
                label="Item Name"
                fullWidth
                margin="normal"
                size="medium"
              />
              <Box mt={2}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  color="primary"
                  disabled={!newItem.trim()}
                  sx={{ py: 1 }}
                >
                  Add Item
                </Button>
              </Box>
            </form>
          </Box>

          <Box mb={2}>
            <Typography variant="h6" gutterBottom>Items from Database</Typography>
            {loading && (
              <Box display="flex" justifyContent="center" my={4} data-testid="loading-indicator">
                <CircularProgress aria-label="Loading data" />
              </Box>
            )}
            {error && <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>}
            {!loading && !error && (
              <>
                {data.length > 0 ? (
                  <TableContainer component={Paper} elevation={3} sx={{ mb: 4 }}>
                    <Table size="medium" sx={{ minWidth: 650 }}>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Created At</TableCell>
                          <TableCell align="right">Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {data.map(item => (
                          <TableRow 
                            key={item.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            <TableCell component="th" scope="row">{item.id}</TableCell>
                            <TableCell>{item.name}</TableCell>
                            <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                            <TableCell align="right">
                              <Button 
                                onClick={() => handleDelete(item.id)} 
                                color="error"
                                variant="outlined"
                                size="small"
                                startIcon={<DeleteIcon />}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Box 
                    sx={{ 
                      p: 4, 
                      textAlign: 'center', 
                      bgcolor: '#f9f9f9', 
                      borderRadius: 1,
                      border: '1px dashed #ccc' 
                    }}
                  >
                    <Typography variant="body1" color="text.secondary">
                      No items found. Add some!
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>
      </Container>
    </div>
  );
}

export default App;
