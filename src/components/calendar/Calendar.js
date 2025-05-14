import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Grid, 
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
  Alert,
  Snackbar
} from '@mui/material';
import { 
  CalendarMonth as CalendarIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import ReactCalendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { format, parseISO, isEqual, startOfDay, addMonths, isBefore } from 'date-fns';

// Custom styles for the calendar
const calendarStyles = {
  '.react-calendar': {
    width: '100%',
    maxWidth: '100%',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    fontFamily: 'inherit',
    lineHeight: '1.5',
  },
  '.react-calendar__tile': {
    padding: '10px',
    height: '60px',
    position: 'relative',
  },
  '.react-calendar__tile--active': {
    backgroundColor: '#1976d2',
    color: 'white',
  },
  '.react-calendar__tile--now': {
    backgroundColor: '#f0f7ff',
  },
  '.react-calendar__month-view__days__day--weekend': {
    color: '#d10000',
  },
  '.attendance-marker': {
    position: 'absolute',
    bottom: '5px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '80%',
    borderRadius: '4px',
    padding: '2px 0',
    fontSize: '10px',
    textAlign: 'center',
  },
  '.attendance-confirmed': {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  '.attendance-pending': {
    backgroundColor: '#ff9800',
    color: 'white',
  },
};

const Calendar = () => {
  const [date, setDate] = useState(new Date());
  const [attendanceDays, setAttendanceDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('confirmed');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) return;
        
        setUserId(auth.currentUser.uid);
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAttendanceDays(userData.attendanceDays || []);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load attendance data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleDateClick = (value) => {
    // Prevent selecting dates in the past
    if (isBefore(startOfDay(value), startOfDay(new Date()))) {
      setSnackbar({
        open: true,
        message: 'Cannot modify attendance for past dates',
        severity: 'warning'
      });
      return;
    }
    
    // Prevent selecting dates more than 3 months in the future
    if (isBefore(addMonths(new Date(), 3), value)) {
      setSnackbar({
        open: true,
        message: 'Cannot schedule attendance more than 3 months in advance',
        severity: 'warning'
      });
      return;
    }
    
    setSelectedDate(value);
    
    // Check if date already has attendance
    const existingAttendance = attendanceDays.find(day => 
      isEqual(
        startOfDay(parseISO(day.date)), 
        startOfDay(value)
      )
    );
    
    if (existingAttendance) {
      setAttendanceStatus(existingAttendance.status);
    } else {
      setAttendanceStatus('confirmed');
    }
    
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedDate(null);
  };

  const handleAttendanceSubmit = async () => {
    if (!selectedDate || !userId) return;
    
    try {
      setLoading(true);
      
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const userRef = doc(db, 'users', userId);
      
      // Check if date already has attendance
      const existingAttendance = attendanceDays.find(day => 
        day.date === formattedDate
      );
      
      if (existingAttendance) {
        // Remove existing attendance
        await updateDoc(userRef, {
          attendanceDays: arrayRemove(existingAttendance)
        });
        
        // If not removing (changing status), add new attendance
        if (attendanceStatus !== 'remove') {
          await updateDoc(userRef, {
            attendanceDays: arrayUnion({
              date: formattedDate,
              status: attendanceStatus,
              updatedAt: new Date().toISOString()
            })
          });
        }
        
        // Update local state
        setAttendanceDays(prev => {
          const filtered = prev.filter(day => day.date !== formattedDate);
          if (attendanceStatus !== 'remove') {
            return [...filtered, {
              date: formattedDate,
              status: attendanceStatus,
              updatedAt: new Date().toISOString()
            }];
          }
          return filtered;
        });
        
        setSnackbar({
          open: true,
          message: attendanceStatus === 'remove' 
            ? 'Attendance removed successfully' 
            : 'Attendance updated successfully',
          severity: 'success'
        });
      } else if (attendanceStatus !== 'remove') {
        // Add new attendance
        await updateDoc(userRef, {
          attendanceDays: arrayUnion({
            date: formattedDate,
            status: attendanceStatus,
            updatedAt: new Date().toISOString()
          })
        });
        
        // Update local state
        setAttendanceDays(prev => [
          ...prev, 
          {
            date: formattedDate,
            status: attendanceStatus,
            updatedAt: new Date().toISOString()
          }
        ]);
        
        setSnackbar({
          open: true,
          message: 'Attendance added successfully',
          severity: 'success'
        });
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update attendance',
        severity: 'error'
      });
    } finally {
      setLoading(false);
      handleDialogClose();
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Custom tile content to show attendance status
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null;
    
    const formattedDate = format(date, "yyyy-MM-dd");
    const attendance = attendanceDays.find(day => day.date === formattedDate);
    
    if (!attendance) return null;
    
    return (
      <div 
        className={`attendance-marker ${
          attendance.status === 'confirmed' 
            ? 'attendance-confirmed' 
            : 'attendance-pending'
        }`}
      >
        {attendance.status === 'confirmed' ? 'In Office' : 'Tentative'}
      </div>
    );
  };

  if (loading && attendanceDays.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Office Attendance Calendar
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage your office attendance schedule. Click on a date to set or update your attendance status.
      </Typography>
      
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item>
              <Chip 
                icon={<CheckIcon />} 
                label="Confirmed" 
                color="success" 
                variant="outlined" 
              />
            </Grid>
            <Grid item>
              <Chip 
                icon={<EditIcon />} 
                label="Tentative" 
                color="warning" 
                variant="outlined" 
              />
            </Grid>
          </Grid>
        </Box>
        
        <Box sx={calendarStyles}>
          <ReactCalendar
            onChange={setDate}
            value={date}
            onClickDay={handleDateClick}
            tileContent={tileContent}
            minDetail="month"
            prev2Label={null}
            next2Label={null}
          />
        </Box>
      </Paper>
      
      {/* Attendance Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose}>
        <DialogTitle>
          {selectedDate && `Set Attendance for ${format(selectedDate, 'MMMM d, yyyy')}`}
        </DialogTitle>
        <DialogContent>
          <FormControl component="fieldset">
            <RadioGroup
              aria-label="attendance-status"
              name="attendance-status"
              value={attendanceStatus}
              onChange={(e) => setAttendanceStatus(e.target.value)}
            >
              <FormControlLabel 
                value="confirmed" 
                control={<Radio />} 
                label="I will be in the office (Confirmed)" 
              />
              <FormControlLabel 
                value="pending" 
                control={<Radio />} 
                label="I might be in the office (Tentative)" 
              />
              <FormControlLabel 
                value="remove" 
                control={<Radio />} 
                label="Remove attendance for this day" 
              />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleAttendanceSubmit} 
            color="primary" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Save'}
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

export default Calendar;
