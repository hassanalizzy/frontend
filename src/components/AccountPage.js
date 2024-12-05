import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

function AccountPage() {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = () => {
    axios
      .get('http://localhost:8000/api/user/', {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setUserData({ ...userData, username: response.data.username });
      })
      .catch((error) => {
        console.error('Error fetching user data', error);
      });
  };

  const handleUpdate = () => {
    const data = {};
    if (userData.username) data.username = userData.username;
    if (newPassword) data.password = newPassword;

    axios
      .put('http://localhost:8000/api/user/', data, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then(() => {
        alert('Account updated successfully.');
        setNewPassword('');
      })
      .catch((error) => {
        console.error('Error updating account', error);
        alert('Failed to update account.');
      });
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Account Management
        </Typography>
        <TextField
          label="Username"
          variant="outlined"
          fullWidth
          margin="normal"
          value={userData.username}
          onChange={(e) => setUserData({ ...userData, username: e.target.value })}
        />
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleUpdate}
        >
          Update Account
        </Button>
      </Box>
    </Container>
  );
}

export default AccountPage;