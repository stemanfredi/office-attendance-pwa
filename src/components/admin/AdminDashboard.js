import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  LocalParking as ParkingIcon,
  CalendarMonth as CalendarIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebase';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { format, parseISO, startOfToday, isAfter, isBefore, addDays } from 'date-fns';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    todayAttendance: 0,
    parkingSpaces: 0,
    parkingUtilization: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // For demo purposes, we'll use mock data
        // In a real app, you would fetch this data from Firestore
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock stats
        setStats({
          totalUsers: 87,
          activeUsers: 64,
          todayAttendance: 42,
          parkingSpaces: 30,
          parkingUtilization: 93
        });
        
        // Mock recent users
        setRecentUsers([
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', createdAt: '2025-05-10T08:30:00Z' },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', createdAt: '2025-05-09T14:15:00Z' },
          { id: '3', firstName: 'Michael', lastName: 'Johnson', email: 'michael.j@example.com', createdAt: '2025-05-08T11:45:00Z' },
          { id: '4', firstName: 'Emily', lastName: 'Williams', email: 'emily.w@example.com', createdAt: '2025-05-07T09:20:00Z' },
          { id: '5', firstName: 'Robert', lastName: 'Brown', email: 'robert.b@example.com', createdAt: '2025-05-06T16:10:00Z' }
        ]);
        
        // In a real app, you would fetch actual data like this:
        /*
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;
        
        const today = startOfToday();
        const attendanceQuery = query(
          collection(db, 'users'),
          where('attendanceDays', 'array-contains', { date: format(today, 'yyyy-MM-dd') })
        );
        const attendanceSnapshot = await getDocs(attendanceQuery);
        const todayAttendance = attendanceSnapshot.size;
        
        // Get recent users
        const recentUsersQuery = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentUsersSnapshot = await getDocs(recentUsersQuery);
        const recentUsersData = recentUsersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setRecentUsers(recentUsersData);
        */
      } catch (error) {
        console.error('Error fetching admin data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load admin dashboard data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAdminData();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Overview of system statistics and management tools.
      </Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="h3" component="div">
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.activeUsers} active users
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/users')}>
                Manage Users
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Today's Attendance
              </Typography>
              <Typography variant="h3" component="div">
                {stats.todayAttendance}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {Math.round((stats.todayAttendance / stats.activeUsers) * 100)}% of active users
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">
                View Details
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Parking Spaces
              </Typography>
              <Typography variant="h3" component="div">
                {stats.parkingSpaces}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {stats.parkingUtilization}% utilization
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/admin/parking-settings')}>
                Manage Parking
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                System Status
              </Typography>
              <Typography variant="h5" component="div" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                Operational
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last updated: {format(new Date(), 'MMM d, h:mm a')}
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small">
                System Settings
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
      
      {/* Admin Tools */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Admin Tools
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PeopleIcon />}
              onClick={() => navigate('/admin/users')}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
            >
              <Typography variant="body1" sx={{ mt: 1 }}>
                User Management
              </Typography>
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ParkingIcon />}
              onClick={() => navigate('/admin/parking-settings')}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
            >
              <Typography variant="body1" sx={{ mt: 1 }}>
                Parking Settings
              </Typography>
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<CalendarIcon />}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
            >
              <Typography variant="body1" sx={{ mt: 1 }}>
                Attendance Reports
              </Typography>
            </Button>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<SettingsIcon />}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', py: 2 }}
            >
              <Typography variant="body1" sx={{ mt: 1 }}>
                System Settings
              </Typography>
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Recent Users */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Recently Added Users
        </Typography>
        
        <List>
          {recentUsers.map((user, index) => (
            <React.Fragment key={user.id}>
              <ListItem>
                <ListItemText
                  primary={`${user.firstName} ${user.lastName}`}
                  secondary={
                    <>
                      {user.email} • Added {format(parseISO(user.createdAt), 'MMM d, yyyy')}
                    </>
                  }
                />
                <Button 
                  size="small" 
                  variant="outlined"
                  onClick={() => navigate(`/admin/users?id=${user.id}`)}
                >
                  View
                </Button>
              </ListItem>
              {index < recentUsers.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
        
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/admin/users')}
          >
            View All Users
          </Button>
        </Box>
      </Paper>
      
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

export default AdminDashboard;
