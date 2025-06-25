# Material-UI (MUI) Guidelines

This document outlines the guidelines and best practices for using Material-UI (MUI) components in this project.

## Introduction

Material-UI (MUI) is a React component library that implements Google's Material Design. It provides a comprehensive set of pre-built components that follow Material Design principles, ensuring consistent and accessible user interfaces.

## Installation and Setup

To use MUI in this project, install the following packages:

```bash
npm install @mui/material @emotion/react @emotion/styled
npm install @mui/icons-material # For icons
npm install @mui/x-date-pickers # For date/time pickers (optional)
```

### Theme Configuration

Create a centralized theme configuration to maintain consistency across the application:

```javascript
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  spacing: 8, // Default spacing unit
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Your app components */}
    </ThemeProvider>
  );
}
```

## Component Usage Guidelines

### Layout Components

#### Container
Use `Container` for responsive layout with max-width constraints:

```javascript
import { Container } from '@mui/material';

<Container maxWidth="lg">
  {/* Content */}
</Container>
```

#### Grid System
Use the `Grid` component for responsive layouts:

```javascript
import { Grid } from '@mui/material';

<Grid container spacing={2}>
  <Grid item xs={12} md={6}>
    {/* Content */}
  </Grid>
  <Grid item xs={12} md={6}>
    {/* Content */}
  </Grid>
</Grid>
```

#### Stack
Use `Stack` for simple vertical or horizontal layouts:

```javascript
import { Stack } from '@mui/material';

<Stack spacing={2} direction="row" alignItems="center">
  {/* Items */}
</Stack>
```

### Form Components

#### TextField
Use `TextField` for input fields with consistent styling:

```javascript
import { TextField } from '@mui/material';

<TextField
  label="Name"
  variant="outlined"
  fullWidth
  value={value}
  onChange={handleChange}
  error={!!error}
  helperText={error}
/>
```

#### Button
Use consistent button variants and colors:

```javascript
import { Button } from '@mui/material';

<Button variant="contained" color="primary" onClick={handleClick}>
  Primary Action
</Button>

<Button variant="outlined" color="secondary" onClick={handleClick}>
  Secondary Action
</Button>

<Button variant="text" onClick={handleClick}>
  Text Action
</Button>
```

#### Form Controls
Use `FormControl`, `FormLabel`, and `FormHelperText` for complex form inputs:

```javascript
import { FormControl, FormLabel, FormHelperText, RadioGroup, FormControlLabel, Radio } from '@mui/material';

<FormControl component="fieldset">
  <FormLabel component="legend">Options</FormLabel>
  <RadioGroup value={value} onChange={handleChange}>
    <FormControlLabel value="option1" control={<Radio />} label="Option 1" />
    <FormControlLabel value="option2" control={<Radio />} label="Option 2" />
  </RadioGroup>
  <FormHelperText>Choose one option</FormHelperText>
</FormControl>
```

### Data Display Components

#### Typography
Use `Typography` component for consistent text styling:

```javascript
import { Typography } from '@mui/material';

<Typography variant="h1" component="h1" gutterBottom>
  Main Title
</Typography>

<Typography variant="body1" color="text.secondary">
  Body text content
</Typography>
```

#### Table
Use MUI table components for data display:

```javascript
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';

<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Column 1</TableCell>
        <TableCell>Column 2</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          <TableCell>{row.name}</TableCell>
          <TableCell>{row.value}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</TableContainer>
```

#### Cards
Use `Card` components for grouped content:

```javascript
import { Card, CardContent, CardActions, CardHeader } from '@mui/material';

<Card>
  <CardHeader title="Card Title" subheader="Subtitle" />
  <CardContent>
    {/* Card content */}
  </CardContent>
  <CardActions>
    <Button size="small">Action</Button>
  </CardActions>
</Card>
```

### Navigation Components

#### AppBar
Use `AppBar` for application headers:

```javascript
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

<AppBar position="sticky">
  <Toolbar>
    <IconButton edge="start" color="inherit" aria-label="menu">
      <MenuIcon />
    </IconButton>
    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
      App Title
    </Typography>
  </Toolbar>
</AppBar>
```

#### Drawer
Use `Drawer` for navigation sidebars:

```javascript
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';

<Drawer variant="permanent" open={open}>
  <List>
    <ListItem button>
      <ListItemIcon>
        <HomeIcon />
      </ListItemIcon>
      <ListItemText primary="Home" />
    </ListItem>
  </List>
</Drawer>
```

### Feedback Components

#### Snackbar
Use `Snackbar` for temporary messages:

```javascript
import { Snackbar, Alert } from '@mui/material';

<Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
  <Alert onClose={handleClose} severity="success">
    Operation completed successfully!
  </Alert>
</Snackbar>
```

#### Dialog
Use `Dialog` for modal interactions:

```javascript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';

<Dialog open={open} onClose={handleClose}>
  <DialogTitle>Dialog Title</DialogTitle>
  <DialogContent>
    {/* Dialog content */}
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleConfirm} variant="contained">Confirm</Button>
  </DialogActions>
</Dialog>
```

## Styling Guidelines

### Using the sx Prop
Prefer the `sx` prop for component-specific styling:

```javascript
<Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    p: 2,
    border: 1,
    borderColor: 'divider',
    borderRadius: 1,
  }}
>
  {/* Content */}
</Box>
```

### Theme Integration
Use theme values in the `sx` prop:

```javascript
<Typography
  sx={{
    color: 'primary.main',
    fontSize: 'h6.fontSize',
    fontWeight: 'bold',
    mb: theme => theme.spacing(2),
  }}
>
  Themed Text
</Typography>
```

### Responsive Styling
Use responsive breakpoints in styling:

```javascript
<Box
  sx={{
    display: { xs: 'block', md: 'flex' },
    gap: { xs: 1, md: 2 },
    p: { xs: 1, sm: 2, md: 3 },
  }}
>
  {/* Responsive content */}
</Box>
```

## Icons

### Using MUI Icons
Import and use icons from `@mui/icons-material`:

```javascript
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

<IconButton onClick={handleDelete} color="error">
  <DeleteIcon />
</IconButton>
```

### Icon Buttons
Use `IconButton` for actionable icons:

```javascript
import { IconButton, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';

<Tooltip title="Add to favorites">
  <IconButton onClick={handleFavorite} color="primary">
    <FavoriteIcon />
  </IconButton>
</Tooltip>
```

## Accessibility

### ARIA Labels
Always provide appropriate ARIA labels:

```javascript
<IconButton aria-label="delete" onClick={handleDelete}>
  <DeleteIcon />
</IconButton>

<TextField
  inputProps={{
    'aria-label': 'search field',
  }}
/>
```

### Focus Management
Ensure proper focus management in interactive components:

```javascript
<Button
  autoFocus
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Action Button
</Button>
```

## Performance Considerations

### Tree Shaking
Import components individually to enable tree shaking:

```javascript
// Preferred
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

// Avoid
import { Button, TextField } from '@mui/material';
```

### Lazy Loading
Use lazy loading for heavy components:

```javascript
import { lazy, Suspense } from 'react';
import { CircularProgress } from '@mui/material';

const DataTable = lazy(() => import('./DataTable'));

<Suspense fallback={<CircularProgress />}>
  <DataTable />
</Suspense>
```

## Best Practices

1. **Consistent Theming**: Always use the theme provider and stick to theme values
2. **Component Composition**: Combine simple MUI components to create complex interfaces
3. **Responsive Design**: Use MUI's responsive features (Grid, breakpoints, sx prop)
4. **Accessibility First**: Always consider accessibility when implementing components
5. **Performance**: Import components individually and use lazy loading when appropriate
6. **Documentation**: Document custom components that extend MUI components

## Common Patterns

### Loading States
```javascript
import { Skeleton, CircularProgress } from '@mui/material';

// For content loading
<Skeleton variant="rectangular" width="100%" height={200} />

// For button loading
<Button disabled={loading} startIcon={loading && <CircularProgress size={20} />}>
  {loading ? 'Loading...' : 'Submit'}
</Button>
```

### Error Handling
```javascript
import { Alert, AlertTitle } from '@mui/material';

<Alert severity="error">
  <AlertTitle>Error</AlertTitle>
  Something went wrong — <strong>check it out!</strong>
</Alert>
```

### Form Validation
```javascript
import { TextField, FormHelperText } from '@mui/material';

<TextField
  error={!!fieldError}
  helperText={fieldError || 'Enter a valid value'}
  onChange={handleChange}
  onBlur={handleBlur}
/>
```

## Migration from Custom Components

When migrating existing components to use MUI:

1. **Identify Similar MUI Components**: Find MUI components that match your existing functionality
2. **Preserve Existing Props**: Ensure your component API remains consistent
3. **Update Styling**: Replace custom CSS with MUI's styling system
4. **Test Thoroughly**: Verify that all functionality and accessibility features are maintained
5. **Update Documentation**: Document any changes in component usage

For more information, refer to the [official MUI documentation](https://mui.com/).
