import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  CircularProgress,
  Alert,
  Snackbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch
} from '@mui/material';
import { 
  Person as PersonIcon,
  Save as SaveIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { auth, db, storage } from '../../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    department: '',
    position: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    parkingReminders: true,
    attendanceReminders: true
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!auth.currentUser) return;
        
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser(userData);
          
          // Set form data
          setFormData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || auth.currentUser.email || '',
            phoneNumber: userData.phoneNumber || '',
            department: userData.department || '',
            position: userData.position || ''
          });
          
          // Set preferences
          setPreferences(userData.preferences || {
            emailNotifications: true,
            pushNotifications: false,
            parkingReminders: true,
            attendanceReminders: true
          });
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        setSnackbar({
          open: true,
          message: 'Failed to load profile data',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePreferenceChange = (name) => (event) => {
    setPreferences(prev => ({
      ...prev,
      [name]: event.target.checked
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      const userRef = doc(db, 'users', auth.currentUser.uid);
      
      // Update profile data in Firestore
      await updateDoc(userRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        department: formData.department,
        position: formData.position,
        preferences: preferences,
        updatedAt: new Date().toISOString()
      });
      
      // Update display name in Firebase Auth
      await updateProfile(auth.currentUser, {
        displayName: `${formData.firstName} ${formData.lastName}`
      });
      
      // Upload profile image if changed
      if (profileImage) {
        const storageRef = ref(storage, `profile-images/${auth.currentUser.uid}`);
        await uploadBytes(storageRef, profileImage);
        
        const downloadURL = await getDownloadURL(storageRef);
        
        // Update profile photo URL in Firebase Auth
        await updateProfile(auth.currentUser, {
          photoURL: downloadURL
        });
        
        // Update profile photo URL in Firestore
        await updateDoc(userRef, {
          photoURL: downloadURL
        });
      }
      
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setSaving(false);
    }
  };

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
        Profile
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" paragraph>
        Manage your personal information and preferences.
      </Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit} noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="firstName"
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="lastName"
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
              </Grid>
              
              <TextField
                margin="normal"
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                value={formData.email}
                disabled={true} // Email can't be changed
                helperText="Email address cannot be changed"
              />
              
              <TextField
                margin="normal"
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={saving}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    fullWidth
                    id="department"
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    margin="normal"
                    fullWidth
                    id="position"
                    label="Position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    disabled={saving}
                  />
                </Grid>
              </Grid>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<SaveIcon />}
                disabled={saving}
                sx={{ mt: 3 }}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Profile Picture
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={imagePreview || auth.currentUser?.photoURL}
                alt={auth.currentUser?.displayName || 'User'}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              
              <Button
                variant="outlined"
                component="label"
                disabled={saving}
              >
                Change Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>
            </Box>
          </Paper>
          
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            
            <List>
              <ListItem>
                <ListItemText 
                  primary="Email Notifications" 
                  secondary="Receive updates via email"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={preferences.emailNotifications}
                    onChange={handlePreferenceChange('emailNotifications')}
                    disabled={saving}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Push Notifications" 
                  secondary="Receive updates on your device"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={preferences.pushNotifications}
                    onChange={handlePreferenceChange('pushNotifications')}
                    disabled={saving}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Parking Reminders" 
                  secondary="Get reminded about parking assignments"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={preferences.parkingReminders}
                    onChange={handlePreferenceChange('parkingReminders')}
                    disabled={saving}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <Divider />
              
              <ListItem>
                <ListItemText 
                  primary="Attendance Reminders" 
                  secondary="Get reminded about office days"
                />
                <ListItemSecondaryAction>
                  <Switch
                    edge="end"
                    checked={preferences.attendanceReminders}
                    onChange={handlePreferenceChange('attendanceReminders')}
                    disabled={saving}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>
      
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

export default Profile;
