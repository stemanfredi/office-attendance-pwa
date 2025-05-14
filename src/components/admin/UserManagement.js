import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  InputAdornment,
  Grid
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { auth, db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { format, parseISO } from 'date-fns';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    position: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // For demo purposes, we'll use mock data
        // In a real app, you would fetch this data from Firestore
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock users
        const mockUsers = [
          { 
            id: '1', 
            firstName: 'John', 
            lastName: 'Doe', 
            email: 'john.doe@example.com', 
            role: 'admin', 
            department: 'IT', 
            position: 'System Administrator',
            createdAt: '2025-04-15T08:30:00Z',
            status: 'active'
          },
          { 
            id: '2', 
            firstName: 'Jane', 
            lastName: 'Smith', 
            email: 'jane.smith@example.com', 
            role: 'user', 
            department: 'HR', 
            position: 'HR Manager',
            createdAt: '2025-04-20T14:15:00Z',
            status: 'active'
          },
          { 
            id: '3', 
            firstName: 'Michael', 
            lastName: 'Johnson', 
            email: 'michael.j@example.com', 
            role: 'user', 
            department: 'Finance', 
            position: 'Financial Analyst',
            createdAt: '2025-04-25T11:45:00Z',
            status: 'active'
          },
          { 
            id: '4', 
            firstName: 'Emily', 
            lastName: 'Williams', 
            email: 'emily.w@example.com', 
            role: 'user', 
            department: 'Marketing', 
            position: 'Marketing Specialist',
            createdAt: '2025-04-28T09:20:00Z',
            status: 'inactive'
          },
          { 
            id: '5', 
            firstName: 'Robert', 
            lastName: 'Brown', 
            email: 'robert.b@example.com', 
            role: 'user', 
            department: 'Sales', 
            position: 'Sales Representative',
            createdAt: '2025-05-01T16:10:00Z',
            status: 'active'
          },
          { 
            id: '6', 
            firstName: 'Sarah', 
            lastName: 'Davis', 
            email: 'sarah.d@example.com', 
            role: 'admin', 
            department: 'IT', 
            position: 'IT Manager',
            createdAt: '2025-05-05T10:30:00Z',
            status: 'active'
          },
          { 
            id: '7', 
            firstName: 'David', 
            lastName: 'Miller', 
            email: 'david.m@example.com', 
            role: 'user', 
            department: 'Operations', 
            position: 'Operations Manager',
            createdAt: '2025-05-08T13:45:00Z',
            status: 'active'
          },
          { 
            id: '8', 
            firstName: 'Jessica', 
            lastName: 'Wilson', 
            email: 'jessica.w@example.com', 
            role: 'user', 
            department: 'Customer Service', 
            position: 'Customer Service Rep',
            createdAt: '2025-05-10T09:15:00Z',
            status: 'active'
          },
          { 
            id: '9', 
            firstName: 'Thomas', 
            lastName: 'Moore', 
            email: 'thomas.m@example.com', 
            role: 'user', 
            department: 'Research', 
            position: 'Research Analyst',
            createdAt: '2025-05-12T11:20:00Z',
            status: 'inactive'
          },
          { 
            id: '10', 
            firstName: 'Jennifer', 
            lastName: 'Taylor', 
            email: 'jennifer.t@example.com', 
            role: 'user', 
            department: 'Legal', 
            position: 'Legal Assistant',
            createdAt: '2025-05-14T14:30:00Z',
            status: 'active'
          },
          { 
            id: '11', 
            firstName: 'Daniel', 
            lastName: 'Anderson', 
            email: 'daniel.a@example.com', 
            role: 'user', 
            department: 'Engineering', 
            position: 'Software Engineer',
            createdAt: '2025-05-15T10:00:00Z',
            status: 'active'
          },
          { 
            id: '12', 
            firstName: 'Lisa', 
            lastName: 'Thomas', 
            email: 'lisa.t@example.com', 
            role: 'user', 
            department: 'Product', 
            position: 'Product Manager',
            createdAt: '2025-05-16T09:45:00Z',
            status: 'active'
          }
        ];
        
        setUsers(mockUsers);
        
        // In a real app, you would fetch actual data like this:
        /*
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        */
      } catch (error) {
        console.error('Error fetching users:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load users',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setFilterRole(event.target.value);
    setPage(0);
  };

  const handleDialogOpen = (user = null) => {
    if (user) {
      // Edit mode
      setIsEditing(true);
      setSelectedUser(user);
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: '', // Don't show password in edit mode
        role: user.role,
        department: user.department || '',
        position: user.position || ''
      });
    } else {
      // Add mode
      setIsEditing(false);
      setSelectedUser(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        department: '',
        position: ''
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeleteDialogOpen = (user) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isEditing) {
        // Update existing user
        // In a real app, you would update the user in Firestore
        const updatedUsers = users.map(user => 
          user.id === selectedUser.id 
            ? { 
                ...user, 
                firstName: formData.firstName,
                lastName: formData.lastName,
                role: formData.role,
                department: formData.department,
                position: formData.position
              } 
            : user
        );
        
        setUsers(updatedUsers);
        
        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      } else {
        // Add new user
        // In a real app, you would create the user in Firebase Auth and Firestore
        const newUser = {
          id: (users.length + 1).toString(),
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          role: formData.role,
          department: formData.department,
          position: formData.position,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        
        setUsers([...users, newUser]);
        
        setSnackbar({
          open: true,
          message: 'User added successfully',
          severity: 'success'
        });
      }
      
      handleDialogClose();
    } catch (error) {
      console.error('Error saving user:', error);
      setSnackbar({
        open: true,
        message: isEditing ? 'Failed to update user' : 'Failed to add user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would delete the user from Firebase Auth and Firestore
      const updatedUsers = users.filter(user => user.id !== selectedUser.id);
      setUsers(updatedUsers);
      
      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });
      
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting user:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete user',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Filter and search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.position?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesFilter;
  });

  // Pagination
  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading && users.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage system users, their roles, and permissions.
      </Typography>
      
      {/* Search and Filter */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search Users"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{ flexGrow: 1, minWidth: '200px' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          
          <FormControl variant="outlined" size="small" sx={{ minWidth: '150px' }}>
            <InputLabel id="role-filter-label">Role</InputLabel>
            <Select
              labelId="role-filter-label"
              id="role-filter"
              value={filterRole}
              onChange={handleFilterChange}
              label="Role"
            >
              <MenuItem value="all">All Roles</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="user">User</MenuItem>
            </Select>
          </FormControl>
          
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen()}
          >
            Add User
          </Button>
        </Box>
      </Paper>
      
      {/* Users Table */}
      <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="users table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Position</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{`${user.firstName} ${user.lastName}`}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.role === 'admin' ? 'Admin' : 'User'} 
                      color={user.role === 'admin' ? 'primary' : 'default'} 
                      size="small" 
                    />
                  </TableCell>
                  <TableCell>{user.department || '-'}</TableCell>
                  <TableCell>{user.position || '-'}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status === 'active' ? 'Active' : 'Inactive'} 
                      color={user.status === 'active' ? 'success' : 'error'} 
                      size="small" 
                      icon={user.status === 'active' ? <CheckCircleIcon /> : <CancelIcon />}
                    />
                  </TableCell>
                  <TableCell>{format(parseISO(user.createdAt), 'MMM d, yyyy')}</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      color="primary" 
                      size="small"
                      onClick={() => handleDialogOpen(user)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      size="small"
                      onClick={() => handleDeleteDialogOpen(user)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No users found matching your criteria
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Add/Edit User Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                label="Email Address"
                value={formData.email}
                onChange={handleFormChange}
                fullWidth
                required
                disabled={isEditing} // Can't change email in edit mode
                type="email"
              />
            </Grid>
            {!isEditing && (
              <Grid item xs={12}>
                <TextField
                  name="password"
                  label="Password"
                  value={formData.password}
                  onChange={handleFormChange}
                  fullWidth
                  required
                  type="password"
                />
              </Grid>
            )}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  onChange={handleFormChange}
                  label="Role"
                >
                  <MenuItem value="admin">Admin</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="department"
                label="Department"
                value={formData.department}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="position"
                label="Position"
                value={formData.position}
                onChange={handleFormChange}
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : (isEditing ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the user "{selectedUser?.firstName} {selectedUser?.lastName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteUser} 
            variant="contained" 
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
