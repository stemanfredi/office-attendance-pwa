import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const AuthContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  padding: theme.spacing(2),
}));

const AuthPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  maxWidth: '450px',
  width: '100%',
  boxShadow: theme.shadows[3],
}));

const Logo = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(3),
  textAlign: 'center',
}));

const AuthLayout = () => {
  return (
    <AuthContainer maxWidth="sm">
      <AuthPaper elevation={3}>
        <Logo>
          <Typography variant="h4" component="h1" gutterBottom>
            Office Attendance
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Attendance Tracking & Parking Management
          </Typography>
        </Logo>
        <Box width="100%">
          <Outlet />
        </Box>
      </AuthPaper>
      <Box mt={3}>
        <Typography variant="body2" color="textSecondary" align="center">
          &copy; {new Date().getFullYear()} Office Attendance & Parking Manager
        </Typography>
      </Box>
    </AuthContainer>
  );
};

export default AuthLayout;
