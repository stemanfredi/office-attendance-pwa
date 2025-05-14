import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Grid, 
  Paper, 
  Button, 
  Card, 
  CardContent, 
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  LocalParking as ParkingIcon,
  DirectionsCar as CarIcon,
  EventAvailable as EventAvailableIcon,
  EventBusy as EventBusyIcon
} from '@mui/icons-material';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { format, isToday, parseISO, startOfToday, addDays } from 'date-fns';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayParking, setTodayParking] = useState(null);
  const [upcomingAttendance, setUpcomingAttendance] = useState([]);
  const [upcomingParking, setUpcomingParking] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) return;
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          setUser(userDoc.data());
          
          // Process attendance data
          const attendanceDays = userDoc.data().attendanceDays || [];
          const today = startOfToday();
          
          // Check for today's parking assignment
          const parkingAssignments = userDoc.data().parkingAssignments || [];
          const todayAssignment = parkingAssignments.find(assignment => 
            isToday(parseISO(assignment.date))
          );
          
          setTodayParking(todayAssignment);
          
          // Get upcoming attendance (next 7 days)
          const upcoming = attendanceDays
            .filter(day => {
              const date = parseISO(day.date);
              return date > today && date <= addDays(today, 7);
            })
            .sort((a, b) => parseISO(a.date) - parseISO(b.date))
            .slice(0, 5);
          
          setUpcomingAttendance(upcoming);
          
          // Get upcoming parking assignments
          const upcomingParkingAssignments = parkingAssignments
            .filter(assignment => {
              const date = parseISO(assignment.date);
              return date > today && date <= addDays(today, 7);
            })
            .sort((a, b) => parseISO(a.date) - parseISO(b.date))
            .slice(0, 3);
          
          setUpcomingParking(upcomingParkingAssignments);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // For demo purposes - mock data if no real data exists
  const mockUpcomingAttendance = [
    { date: format(addDays(new Date(), 1), "yyyy-MM-dd"), status: 'confirmed' },
    { date: format(addDays(new Date(), 2), "yyyy-MM-dd"), status: 'confirmed' },
    { date: format(addDays(new Date(), 3), "yyyy-MM-dd"), status: 'pending' }
  ];

  const mockUpcomingParking = [
    { date: format(addDays(new Date(), 1), "yyyy-MM-dd"), spot: 'A12' },
    { date: format(addDays(new Date(), 3), "yyyy-MM-dd"), spot: 'B05' }
  ];

  const displayedUpcomingAttendance = upcomingAttendance.length > 0 ? upcomingAttendance : mockUpcomingAttendance;
  const displayedUpcomingParking = upcomingParking.length > 0 ? upcomingParking : mockUpcomingParking;

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Welcome back, {auth.currentUser?.displayName || 'User'}!
      </Typography>
      
      {/* Today's Status */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Today's Status
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <CalendarIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Office Attendance</Typography>
                </Box>
                
                <Typography variant="body1" color="textSecondary">
                  {/* This would be dynamically determined based on user data */}
                  You are scheduled to be in the office today.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <ParkingIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Parking Assignment</Typography>
                </Box>
                
                {todayParking ? (
                  <Box>
                    <Typography variant="body1" color="textSecondary">
                      You have been assigned parking spot:
                    </Typography>
                    <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                      {todayParking.spot}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="textSecondary">
                    No parking spot assigned for today.
                  </Typography>
                )}
              </CardContent>
              
              {todayParking && (
                <CardActions>
                  <Button size="small" startIcon={<CarIcon />}>
                    View Map
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Upcoming Schedule */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Office Days
            </Typography>
            
            <List>
              {displayedUpcomingAttendance.length > 0 ? (
                displayedUpcomingAttendance.map((day, index) => (
                  <React.Fragment key={day.date}>
                    <ListItem>
                      <ListItemText
                        primary={format(parseISO(day.date), 'EEEE, MMMM d')}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                        secondaryTypographyProps={{ 
                          color: day.status === 'confirmed' ? 'success.main' : 'warning.main',
                          component: 'span',
                          sx: { display: 'flex', alignItems: 'center' }
                        }}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            {day.status === 'confirmed' ? (
                              <EventAvailableIcon fontSize="small" color="success" sx={{ mr: 0.5 }} />
                            ) : (
                              <EventBusyIcon fontSize="small" color="warning" sx={{ mr: 0.5 }} />
                            )}
                            {day.status === 'confirmed' ? 'Confirmed' : 'Pending'}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < displayedUpcomingAttendance.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No upcoming office days scheduled.
                </Typography>
              )}
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/calendar')}
                startIcon={<CalendarIcon />}
              >
                Manage Schedule
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Parking Assignments
            </Typography>
            
            <List>
              {displayedUpcomingParking.length > 0 ? (
                displayedUpcomingParking.map((assignment, index) => (
                  <React.Fragment key={assignment.date}>
                    <ListItem>
                      <ListItemText
                        primary={format(parseISO(assignment.date), 'EEEE, MMMM d')}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                        secondaryTypographyProps={{ 
                          color: 'primary.main',
                          component: 'span',
                          sx: { display: 'flex', alignItems: 'center' }
                        }}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CarIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                            {`Spot: ${assignment.spot}`}
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < displayedUpcomingParking.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No upcoming parking assignments.
                </Typography>
              )}
            </List>
            
            <Box sx={{ mt: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={() => navigate('/parking')}
                startIcon={<ParkingIcon />}
              >
                View All Assignments
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
