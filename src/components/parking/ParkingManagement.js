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
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControlLabel,
  Switch,
  TextField
} from '@mui/material';
import { 
  LocalParking as ParkingIcon,
  DirectionsCar as CarIcon,
  CalendarMonth as CalendarIcon,
  EventAvailable as EventAvailableIcon,
  Block as BlockIcon
} from '@mui/icons-material';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { format, parseISO, isToday, isBefore, addDays, startOfToday, isAfter } from 'date-fns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const ParkingManagement = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [parkingAssignments, setParkingAssignments] = useState([]);
  const [parkingExclusions, setParkingExclusions] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [exclusionDialog, setExclusionDialog] = useState(false);
  const [exclusionStartDate, setExclusionStartDate] = useState(new Date());
  const [exclusionEndDate, setExclusionEndDate] = useState(addDays(new Date(), 7));
  const [exclusionReason, setExclusionReason] = useState('');
  const [isPermanent, setIsPermanent] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) return;
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          setParkingAssignments(userData.parkingAssignments || []);
          setParkingExclusions(userData.parkingExclusions || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load parking data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleExclusionDialogOpen = () => {
    setExclusionDialog(true);
  };

  const handleExclusionDialogClose = () => {
    setExclusionDialog(false);
  };

  const handleAddExclusion = async () => {
    try {
      setLoading(true);
      
      if (!isPermanent && isAfter(exclusionStartDate, exclusionEndDate)) {
        setSnackbar({
          open: true,
          message: 'End date must be after start date',
          severity: 'error'
        });
        return;
      }
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      const newExclusion = {
        id: Date.now().toString(),
        startDate: format(exclusionStartDate, "yyyy-MM-dd"),
        endDate: isPermanent ? null : format(exclusionEndDate, "yyyy-MM-dd"),
        reason: exclusionReason,
        isPermanent,
        createdAt: new Date().toISOString()
      };
      
      // Add to Firestore
      const updatedExclusions = [...parkingExclusions, newExclusion];
      await updateDoc(userRef, {
        parkingExclusions: updatedExclusions
      });
      
      // Update local state
      setParkingExclusions(updatedExclusions);
      
      setSnackbar({
        open: true,
        message: 'Parking exclusion added successfully',
        severity: 'success'
      });
      
      handleExclusionDialogClose();
    } catch (error) {
      console.error('Error adding exclusion:', error);
      setSnackbar({
        open: true,
        message: 'Failed to add parking exclusion',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveExclusion = async (exclusionId) => {
    try {
      setLoading(true);
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Remove from Firestore
      const updatedExclusions = parkingExclusions.filter(
        exclusion => exclusion.id !== exclusionId
      );
      
      await updateDoc(userRef, {
        parkingExclusions: updatedExclusions
      });
      
      // Update local state
      setParkingExclusions(updatedExclusions);
      
      setSnackbar({
        open: true,
        message: 'Parking exclusion removed successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error removing exclusion:', error);
      setSnackbar({
        open: true,
        message: 'Failed to remove parking exclusion',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // For demo purposes - mock data if no real data exists
  const mockParkingAssignments = [
    { date: format(addDays(new Date(), 1), "yyyy-MM-dd"), spot: 'A12' },
    { date: format(addDays(new Date(), 3), "yyyy-MM-dd"), spot: 'B05' },
    { date: format(addDays(new Date(), 5), "yyyy-MM-dd"), spot: 'C08' }
  ];

  const displayedParkingAssignments = parkingAssignments.length > 0 
    ? parkingAssignments 
    : mockParkingAssignments;

  // Filter to show only future assignments
  const today = startOfToday();
  const futureAssignments = displayedParkingAssignments
    .filter(assignment => {
      const assignmentDate = parseISO(assignment.date);
      return isAfter(assignmentDate, today) || isToday(assignmentDate);
    })
    .sort((a, b) => parseISO(a.date) - parseISO(b.date));

  if (loading && parkingAssignments.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Parking Management
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        View your parking assignments and manage your parking preferences.
      </Typography>
      
      {/* Today's Parking */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Today's Parking
        </Typography>
        
        <Card variant="outlined">
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <ParkingIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="h6">Parking Assignment</Typography>
            </Box>
            
            {displayedParkingAssignments.some(assignment => isToday(parseISO(assignment.date))) ? (
              <Box>
                <Typography variant="body1" color="textSecondary">
                  You have been assigned parking spot:
                </Typography>
                <Typography variant="h5" color="primary" sx={{ mt: 1, fontWeight: 'bold' }}>
                  {displayedParkingAssignments.find(assignment => 
                    isToday(parseISO(assignment.date))
                  ).spot}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" color="textSecondary">
                No parking spot assigned for today.
              </Typography>
            )}
          </CardContent>
          
          {displayedParkingAssignments.some(assignment => isToday(parseISO(assignment.date))) && (
            <CardActions>
              <Button size="small" startIcon={<CarIcon />}>
                View Map
              </Button>
            </CardActions>
          )}
        </Card>
      </Paper>
      
      {/* Upcoming Parking Assignments */}
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Parking Assignments
            </Typography>
            
            <List>
              {futureAssignments.length > 0 ? (
                futureAssignments.map((assignment, index) => (
                  <React.Fragment key={assignment.date}>
                    <ListItem>
                      <ListItemText
                        primary={format(parseISO(assignment.date), 'EEEE, MMMM d')}
                        secondary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                            <CarIcon fontSize="small" color="primary" sx={{ mr: 0.5 }} />
                            {`Spot: ${assignment.spot}`}
                          </Box>
                        }
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    {index < futureAssignments.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No upcoming parking assignments.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Parking Exclusions
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<BlockIcon />}
                onClick={handleExclusionDialogOpen}
              >
                Add Exclusion
              </Button>
            </Box>
            
            <Typography variant="body2" color="textSecondary" paragraph>
              Periods when you should not be assigned parking.
            </Typography>
            
            <List>
              {parkingExclusions.length > 0 ? (
                parkingExclusions.map((exclusion, index) => (
                  <React.Fragment key={exclusion.id}>
                    <ListItem
                      secondaryAction={
                        <Button 
                          color="error" 
                          size="small"
                          onClick={() => handleRemoveExclusion(exclusion.id)}
                        >
                          Remove
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={exclusion.isPermanent 
                          ? 'Permanent Exclusion' 
                          : `${format(parseISO(exclusion.startDate), 'MMM d, yyyy')} - ${format(parseISO(exclusion.endDate), 'MMM d, yyyy')}`
                        }
                        secondary={exclusion.reason || 'No reason provided'}
                        primaryTypographyProps={{ fontWeight: 'medium' }}
                      />
                    </ListItem>
                    {index < parkingExclusions.length - 1 && <Divider />}
                  </React.Fragment>
                ))
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No parking exclusions set.
                </Typography>
              )}
            </List>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Exclusion Dialog */}
      <Dialog open={exclusionDialog} onClose={handleExclusionDialogClose}>
        <DialogTitle>Add Parking Exclusion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Add a period when you should not be assigned parking. This could be due to vacation, remote work, or other reasons.
          </DialogContentText>
          
          <Box sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Switch 
                  checked={isPermanent} 
                  onChange={(e) => setIsPermanent(e.target.checked)} 
                />
              }
              label="Permanent Exclusion"
            />
          </Box>
          
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <DatePicker
                label="Start Date"
                value={exclusionStartDate}
                onChange={(newValue) => setExclusionStartDate(newValue)}
                disablePast
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              
              {!isPermanent && (
                <DatePicker
                  label="End Date"
                  value={exclusionEndDate}
                  onChange={(newValue) => setExclusionEndDate(newValue)}
                  disablePast
                  minDate={exclusionStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              )}
            </Box>
          </LocalizationProvider>
          
          <TextField
            margin="dense"
            id="reason"
            label="Reason (Optional)"
            type="text"
            fullWidth
            value={exclusionReason}
            onChange={(e) => setExclusionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExclusionDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddExclusion} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Add Exclusion'}
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

export default ParkingManagement;
