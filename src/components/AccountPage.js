import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';

function AccountPage() {
  const [userData, setUserData] = useState({ username: '', password: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Wrap fetchUserData with useCallback
  const fetchUserData = useCallback(() => {
    axios
      .get('http://localhost:8000/api/user/', {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setUserData((prevData) => ({
          ...prevData,
          username: response.data.username,
        }));
      })
      .catch((error) => {
        console.error('Error fetching user data', error);
      });
  }, []); // Empty since no external dependencies are used

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]); // Include fetchUserData in the dependency array

  const handleUpdate = () => {
    // Validate input:
    // If changing password, oldPassword must be provided.
    // newPassword and confirmNewPassword must match if provided.
    if ((newPassword || confirmNewPassword) && !oldPassword) {
      alert('Please enter your current password to change your password.');
      return;
    }

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      alert('New passwords do not match. Please try again.');
      return;
    }

    const data = {};
    // Only include updated fields
    if (userData.username) data.username = userData.username;
    if (newPassword) {
      data.password = newPassword;    // The new password to set
      data.old_password = oldPassword; // The old password for verification
    }

    axios
      .put('http://localhost:8000/api/user/', data, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then(() => {
        alert('Account updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      })
      .catch((error) => {
        console.error('Error updating account', error);
        alert('Failed to update account. Please ensure your old password is correct.');
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
          onChange={(e) =>
            setUserData((prevData) => ({
              ...prevData,
              username: e.target.value,
            }))
          }
        />
        <TextField
          label="Current Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          helperText="Enter your current password if you want to change it."
        />
        <TextField
          label="New Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          helperText="Leave blank if you don't want to change the password."
        />
        <TextField
          label="Confirm New Password"
          variant="outlined"
          type="password"
          fullWidth
          margin="normal"
          value={confirmNewPassword}
          onChange={(e) => setConfirmNewPassword(e.target.value)}
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
