import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate, Link } from 'react-router-dom';

function Header() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isLoggedIn = !!localStorage.getItem('token');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  const menuItems = isLoggedIn
    ? [
        { text: 'Schedule', icon: <ScheduleIcon />, path: '/schedule' },
        { text: 'Account', icon: <AccountCircleIcon />, path: '/account' },
        { text: 'Logout', icon: <LogoutIcon />, action: handleLogout },
      ]
    : [{ text: 'Login', icon: <LoginIcon />, path: '/' }];

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Campus Navigator
      </Typography>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={item.path ? Link : 'button'}
            to={item.path}
            onClick={item.action}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <AppBar position="static" color="primary" elevation={0}>
      <Toolbar>
        <SchoolIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Campus Navigator
        </Typography>

        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="end"
            onClick={handleDrawerToggle}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Box sx={{ display: 'flex' }}>
            {menuItems.map((item) => (
              <Button
                key={item.text}
                color="inherit"
                component={item.path ? Link : 'button'}
                to={item.path}
                onClick={item.action}
                startIcon={item.icon}
                sx={{ color: '#fff' }}
              >
                {item.text}
              </Button>
            ))}
          </Box>
        )}
      </Toolbar>
      <nav>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </nav>
    </AppBar>
  );
}

export default Header;
