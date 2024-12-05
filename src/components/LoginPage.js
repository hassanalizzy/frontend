import React, { useState } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  useTheme,
} from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import logo from '../assets/images/logo.jpg';
import backgroundImage from '../assets/images/login-background.jpg'; // Ensure this path points to your background image

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogin = () => {
    axios
      .post('http://localhost:8000/api/login/', {
        username,
        password,
      })
      .then((response) => {
        localStorage.setItem('token', response.data.token);
        navigate('/schedule');
      })
      .catch((error) => {
        console.error('There was an error logging in!', error);
        alert('Invalid credentials');
      });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Overlay to improve text readability */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      ></Box>

      <Container
        maxWidth="sm"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        <Card elevation={3}>
          <CardContent sx={{ textAlign: 'center' }}>
            {/* Logo */}
            <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '20px' }} />
            <Typography variant="h4" gutterBottom sx={{ color: '#000000' }}>
              Login
            </Typography>
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                style: { color: '#000000' },
              }}
              InputLabelProps={{
                style: { color: '#000000' },
              }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              fullWidth
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                style: { color: '#000000' },
              }}
              InputLabelProps={{
                style: { color: '#000000' },
              }}
            />
          </CardContent>
          <CardActions>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mb: 2 }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </CardActions>
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#000000' }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: theme.palette.secondary.main }}>
                Register here
              </Link>
            </Typography>
          </Box>
        </Card>
      </Container>
    </Box>
  );
}

export default LoginPage;