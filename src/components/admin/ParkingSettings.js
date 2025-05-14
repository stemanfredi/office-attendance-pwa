import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  TextField,
  Grid,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Switch,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Snackbar,
  Slider,
  Tabs,
  Tab,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocalParking as ParkingIcon,
  DirectionsCar as CarIcon,
  Settings as SettingsIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import { auth, db } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// Tab Panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`parking-tabpanel-${index}`}
      aria-labelledby={`parking-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const ParkingSettings = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [parkingSpaces, setParkingSpaces] = useState([]);
  const [allocationSettings, setAllocationSettings] = useState({
    totalSpaces: 30,
    reservedSpaces: 5,
    fairnessWeight: 70,
    attendanceWeight: 30,
    minAttendanceDays: 1,
    maxConsecutiveDays: 3,
    enableWeekendParking: false,
    autoAssign: true,
    assignmentWindow: 7, // days in advance
    notificationTime: 9 // hour of day (24h format)
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    type: 'standard',
    reserved: false,
    assignedTo: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchParkingData = async () => {
      try {
        // For demo purposes, we'll use mock data
        // In a real app, you would fetch this data from Firestore
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock parking spaces
        const mockParkingSpaces = [
          { id: 'A01', name: 'A01', location: 'Level 1', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'A02', name: 'A02', location: 'Level 1', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'A03', name: 'A03', location: 'Level 1', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'A04', name: 'A04', location: 'Level 1', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'A05', name: 'A05', location: 'Level 1', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'B01', name: 'B01', location: 'Level 1', type: 'compact', reserved: false, assignedTo: '' },
          { id: 'B02', name: 'B02', location: 'Level 1', type: 'compact', reserved: false, assignedTo: '' },
          { id: 'B03', name: 'B03', location: 'Level 1', type: 'compact', reserved: false, assignedTo: '' },
          { id: 'B04', name: 'B04', location: 'Level 1', type: 'compact', reserved: false, assignedTo: '' },
          { id: 'B05', name: 'B05', location: 'Level 1', type: 'compact', reserved: false, assignedTo: '' },
          { id: 'C01', name: 'C01', location: 'Level 2', type: 'standard', reserved: true, assignedTo: 'John Doe' },
          { id: 'C02', name: 'C02', location: 'Level 2', type: 'standard', reserved: true, assignedTo: 'Jane Smith' },
          { id: 'C03', name: 'C03', location: 'Level 2', type: 'standard', reserved: true, assignedTo: 'Michael Johnson' },
          { id: 'C04', name: 'C04', location: 'Level 2', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'C05', name: 'C05', location: 'Level 2', type: 'standard', reserved: false, assignedTo: '' },
          { id: 'D01', name: 'D01', location: 'Level 2', type: 'accessible', reserved: true, assignedTo: 'Emily Williams' },
          { id: 'D02', name: 'D02', location: 'Level 2', type: 'accessible', reserved: true, assignedTo: 'Robert Brown' },
          { id: 'D03', name: 'D03', location: 'Level 2', type: 'electric', reserved: false, assignedTo: '' },
          { id: 'D04', name: 'D04', location: 'Level 2', type: 'electric', reserved: false, assignedTo: '' },
          { id: 'D05', name: 'D05', location: 'Level 2', type: 'electric', reserved: false, assignedTo: '' }
        ];
        
        setParkingSpaces(mockParkingSpaces);
        
        // In a real app, you would fetch actual data like this:
        /*
        const parkingRef = doc(db, 'settings', 'parking');
        const parkingDoc = await getDoc(parkingRef);
        
        if (parkingDoc.exists()) {
          const parkingData = parkingDoc.data();
          setParkingSpaces(parkingData.spaces || []);
          setAllocationSettings(parkingData.allocationSettings || {});
        }
        */
      } catch (error) {
        console.error('Error fetching parking data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load parking settings',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchParkingData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDialogOpen = (space = null) => {
    if (space) {
      // Edit mode
      setIsEditing(true);
      setSelectedSpace(space);
      setFormData({
        id: space.id,
        name: space.name,
        location: space.location,
        type: space.type,
        reserved: space.reserved,
        assignedTo: space.assignedTo
      });
    } else {
      // Add mode
      setIsEditing(false);
      setSelectedSpace(null);
      setFormData({
        id: '',
        name: '',
        location: 'Level 1',
        type: 'standard',
        reserved: false,
        assignedTo: ''
      });
    }
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleDeleteDialogOpen = (space) => {
    setSelectedSpace(space);
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

  const handleSwitchChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setAllocationSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSettingsSwitchChange = (e) => {
    const { name, checked } = e.target;
    setAllocationSettings(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleSliderChange = (name) => (e, newValue) => {
    setAllocationSettings(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      if (isEditing) {
        // Update existing space
        const updatedSpaces = parkingSpaces.map(space => 
          space.id === selectedSpace.id ? formData : space
        );
        
        setParkingSpaces(updatedSpaces);
        
        setSnackbar({
          open: true,
          message: 'Parking space updated successfully',
          severity: 'success'
        });
      } else {
        // Add new space
        const newSpace = {
          ...formData,
          id: formData.id || `${formData.name}-${Date.now()}`
        };
        
        setParkingSpaces([...parkingSpaces, newSpace]);
        
        setSnackbar({
          open: true,
          message: 'Parking space added successfully',
          severity: 'success'
        });
      }
      
      handleDialogClose();
    } catch (error) {
      console.error('Error saving parking space:', error);
      setSnackbar({
        open: true,
        message: isEditing ? 'Failed to update parking space' : 'Failed to add parking space',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSpace = async () => {
    try {
      setLoading(true);
      
      const updatedSpaces = parkingSpaces.filter(space => space.id !== selectedSpace.id);
      setParkingSpaces(updatedSpaces);
      
      setSnackbar({
        open: true,
        message: 'Parking space deleted successfully',
        severity: 'success'
      });
      
      handleDeleteDialogClose();
    } catch (error) {
      console.error('Error deleting parking space:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete parking space',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      // In a real app, you would update the settings in Firestore
      // const parkingRef = doc(db, 'settings', 'parking');
      // await updateDoc(parkingRef, {
      //   allocationSettings: allocationSettings
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSnackbar({
        open: true,
        message: 'Allocation settings saved successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error saving allocation settings:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save allocation settings',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Group parking spaces by location
  const groupedSpaces = parkingSpaces.reduce((acc, space) => {
    if (!acc[space.location]) {
      acc[space.location] = [];
    }
    acc[space.location].push(space);
    return acc;
  }, {});

  // Count spaces by type
  const spacesByType = parkingSpaces.reduce((acc, space) => {
    if (!acc[space.type]) {
      acc[space.type] = 0;
    }
    acc[space.type]++;
    return acc;
  }, {});

  if (loading && parkingSpaces.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Parking Settings
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage parking spaces and allocation settings.
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="parking settings tabs">
          <Tab label="Parking Spaces" id="parking-tab-0" aria-controls="parking-tabpanel-0" />
          <Tab label="Allocation Settings" id="parking-tab-1" aria-controls="parking-tabpanel-1" />
        </Tabs>
      </Box>
      
      {/* Parking Spaces Tab */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Parking Spaces ({parkingSpaces.length})
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => handleDialogOpen()}
          >
            Add Space
          </Button>
        </Box>
        
        {/* Parking Space Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Spaces
                </Typography>
                <Typography variant="h3" component="div">
                  {parkingSpaces.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {parkingSpaces.filter(s => s.reserved).length} reserved
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Standard Spaces
                </Typography>
                <Typography variant="h3" component="div">
                  {spacesByType.standard || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {Math.round(((spacesByType.standard || 0) / parkingSpaces.length) * 100)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Accessible Spaces
                </Typography>
                <Typography variant="h3" component="div">
                  {spacesByType.accessible || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {Math.round(((spacesByType.accessible || 0) / parkingSpaces.length) * 100)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Electric Spaces
                </Typography>
                <Typography variant="h3" component="div">
                  {spacesByType.electric || 0}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {Math.round(((spacesByType.electric || 0) / parkingSpaces.length) * 100)}% of total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        {/* Parking Spaces List */}
        {Object.entries(groupedSpaces).map(([location, spaces]) => (
          <Paper key={location} elevation={2} sx={{ mb: 3, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {location} ({spaces.length} spaces)
            </Typography>
            
            <Grid container spacing={2}>
              {spaces.map((space) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={space.id}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          {space.name}
                        </Typography>
                        <Chip 
                          label={space.type} 
                          color={
                            space.type === 'accessible' ? 'primary' : 
                            space.type === 'electric' ? 'success' : 
                            'default'
                          } 
                          size="small" 
                        />
                      </Box>
                      
                      {space.reserved && (
                        <Typography variant="body2" color="error">
                          Reserved: {space.assignedTo}
                        </Typography>
                      )}
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        startIcon={<EditIcon />}
                        onClick={() => handleDialogOpen(space)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="small" 
                        color="error" 
                        startIcon={<DeleteIcon />}
                        onClick={() => handleDeleteDialogOpen(space)}
                      >
                        Delete
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        ))}
      </TabPanel>
      
      {/* Allocation Settings Tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Allocation Algorithm Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography id="fairness-weight-slider" gutterBottom>
                Fairness Weight: {allocationSettings.fairnessWeight}%
              </Typography>
              <Slider
                aria-labelledby="fairness-weight-slider"
                value={allocationSettings.fairnessWeight}
                onChange={handleSliderChange('fairnessWeight')}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
              <Typography variant="body2" color="textSecondary">
                Higher values prioritize equal distribution among all employees
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography id="attendance-weight-slider" gutterBottom>
                Attendance Weight: {allocationSettings.attendanceWeight}%
              </Typography>
              <Slider
                aria-labelledby="attendance-weight-slider"
                value={allocationSettings.attendanceWeight}
                onChange={handleSliderChange('attendanceWeight')}
                valueLabelDisplay="auto"
                step={5}
                marks
                min={0}
                max={100}
              />
              <Typography variant="body2" color="textSecondary">
                Higher values prioritize employees with more office days
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="minAttendanceDays"
                label="Minimum Attendance Days"
                type="number"
                value={allocationSettings.minAttendanceDays}
                onChange={handleSettingsChange}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 5 } }}
                helperText="Minimum days in office to be eligible for parking"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="maxConsecutiveDays"
                label="Maximum Consecutive Days"
                type="number"
                value={allocationSettings.maxConsecutiveDays}
                onChange={handleSettingsChange}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 5 } }}
                helperText="Maximum consecutive days an employee can get parking"
              />
            </Grid>
          </Grid>
        </Paper>
        
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                name="totalSpaces"
                label="Total Parking Spaces"
                type="number"
                value={allocationSettings.totalSpaces}
                onChange={handleSettingsChange}
                fullWidth
                InputProps={{ inputProps: { min: 1 } }}
                helperText="Total number of parking spaces available"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="reservedSpaces"
                label="Reserved Spaces"
                type="number"
                value={allocationSettings.reservedSpaces}
                onChange={handleSettingsChange}
                fullWidth
                InputProps={{ inputProps: { min: 0, max: allocationSettings.totalSpaces } }}
                helperText="Number of permanently reserved spaces"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="assignmentWindow"
                label="Assignment Window (Days)"
                type="number"
                value={allocationSettings.assignmentWindow}
                onChange={handleSettingsChange}
                fullWidth
                InputProps={{ inputProps: { min: 1, max: 30 } }}
                helperText="How many days in advance to assign parking"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                name="notificationTime"
                label="Notification Time (Hour)"
                type="number"
                value={allocationSettings.notificationTime}
                onChange={handleSettingsChange}
                fullWidth
                InputProps={{ inputProps: { min: 0, max: 23 } }}
                helperText="Hour of the day to send parking notifications (24h format)"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allocationSettings.enableWeekendParking}
                    onChange={handleSettingsSwitchChange}
                    name="enableWeekendParking"
                  />
                }
                label="Enable Weekend Parking"
              />
              <Typography variant="body2" color="textSecondary">
                Allow parking allocation on weekends
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={allocationSettings.autoAssign}
                    onChange={handleSettingsSwitchChange}
                    name="autoAssign"
                  />
                }
                label="Auto-Assign Parking"
              />
              <Typography variant="body2" color="textSecondary">
                Automatically assign parking based on attendance
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </Box>
        </Paper>
      </TabPanel>
      
      {/* Add/Edit Parking Space Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{isEditing ? 'Edit Parking Space' : 'Add Parking Space'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="name"
                label="Space Name/Number"
                value={formData.name}
                onChange={handleFormChange}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="location-label">Location</InputLabel>
                <Select
                  labelId="location-label"
                  name="location"
                  value={formData.location}
                  onChange={handleFormChange}
                  label="Location"
                >
                  <MenuItem value="Level 1">Level 1</MenuItem>
                  <MenuItem value="Level 2">Level 2</MenuItem>
                  <MenuItem value="Level 3">Level 3</MenuItem>
                  <MenuItem value="Outdoor">Outdoor</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="type-label">Space Type</InputLabel>
                <Select
                  labelId="type-label"
                  name="type"
                  value={formData.type}
                  onChange={handleFormChange}
                  label="Space Type"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="compact">Compact</MenuItem>
                  <MenuItem value="accessible">Accessible</MenuItem>
                  <MenuItem value="electric">Electric Vehicle</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.reserved}
                    onChange={handleSwitchChange}
                    name="reserved"
                  />
                }
                label="Reserved Space"
              />
            </Grid>
            {formData.reserved && (
              <Grid item xs={12}>
                <TextField
                  name="assignedTo"
                  label="Assigned To"
                  value={formData.assignedTo}
                  onChange={handleFormChange}
                  fullWidth
                  required={formData.reserved}
                  helperText="Name of the person this space is reserved for"
                />
              </Grid>
            )}
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
            Are you sure you want to delete the parking space "{selectedSpace?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button 
            onClick={handleDeleteSpace} 
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

export default ParkingSettings;
