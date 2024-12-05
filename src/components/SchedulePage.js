import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigationIcon from '@mui/icons-material/Navigation';

function SchedulePage() {
  const [className, setClassName] = useState('');
  const [building, setBuilding] = useState(null);
  const [buildings, setBuildings] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [classrooms, setClassrooms] = useState([]);
  const [classTime, setClassTime] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSchedules();
    fetchBuildings();
  }, []);

  useEffect(() => {
    if (building) {
      fetchClassrooms(building.id);
    } else {
      setClassrooms([]);
      setClassroom(null);
    }
  }, [building]);

  const fetchSchedules = () => {
    axios
      .get('http://localhost:8000/api/schedules/', {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setSchedules(response.data);
      })
      .catch((error) => {
        console.error('Error fetching schedules', error);
        setErrorMessage('Failed to fetch schedules.');
      });
  };

  const fetchBuildings = () => {
    axios
      .get('http://localhost:8000/api/buildings/')
      .then((response) => {
        setBuildings(response.data);
      })
      .catch((error) => {
        console.error('Error fetching buildings', error);
        setErrorMessage('Failed to fetch buildings.');
      });
  };

  const fetchClassrooms = (buildingId) => {
    setLoadingClassrooms(true);
    axios
      .get(`http://localhost:8000/api/classrooms/?building_id=${buildingId}`)
      .then((response) => {
        setClassrooms(response.data);
        setLoadingClassrooms(false);
      })
      .catch((error) => {
        console.error('Error fetching classrooms', error);
        setErrorMessage('Failed to fetch classrooms.');
        setLoadingClassrooms(false);
      });
  };

  const handleAddClass = () => {
    if (!building || !classroom) {
      alert('Please select a building and classroom.');
      return;
    }
    axios
      .post(
        'http://localhost:8000/api/schedules/',
        {
          class_name: className,
          classroom_id: classroom.id,
          class_time: classTime,
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem('token')}`,
          },
        }
      )
      .then(() => {
        fetchSchedules();
        setClassName('');
        setBuilding(null);
        setClassroom(null);
        setClassTime('');
        setSnackbarOpen(true);
      })
      .catch((error) => {
        console.error('Error adding class', error);
        setErrorMessage('Failed to add class. Please try again.');
      });
  };

  const handleNavigate = (classId) => {
    navigate(`/navigate/${classId}`);
  };

  const handleDeleteClass = (classId) => {
    setClassToDelete(classId);
    setDialogOpen(true);
  };

  const confirmDeleteClass = () => {
    axios
      .delete(`http://localhost:8000/api/schedules/${classToDelete}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then(() => {
        fetchSchedules();
        setDialogOpen(false);
        setClassToDelete(null);
      })
      .catch((error) => {
        console.error('Error deleting class', error);
        setErrorMessage('Failed to delete class.');
      });
  };

  const isAddClassDisabled = !className || !building || !classroom || !classTime;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Your Schedule
        </Typography>
        <Card elevation={3} sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Class Name"
                variant="outlined"
                fullWidth
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={buildings}
                getOptionLabel={(option) => option.name}
                value={building}
                onChange={(event, newValue) => {
                  setBuilding(newValue);
                  setClassroom(null);
                }}
                renderInput={(params) => (
                  <TextField {...params} label="Building" variant="outlined" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={classrooms}
                getOptionLabel={(option) => option.room_number}
                value={classroom}
                onChange={(event, newValue) => setClassroom(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Classroom"
                    variant="outlined"
                    fullWidth
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loadingClassrooms ? <CircularProgress size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
                disabled={!building}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                label="Class Time"
                variant="outlined"
                type="time"
                InputLabelProps={{ shrink: true }}
                fullWidth
                value={classTime}
                onChange={(e) => setClassTime(e.target.value)}
              />
            </Grid>
          </Grid>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={handleAddClass}
            disabled={isAddClassDisabled}
          >
            Add Class
          </Button>
        </Card>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {schedules.map((schedule) => (
            <Grid item xs={12} sm={6} md={4} key={schedule.id}>
              <Card elevation={2}>
                <CardContent>
                  <Typography variant="h6">{schedule.class_name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {schedule.classroom.building.name} Room {schedule.classroom.room_number}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {schedule.class_time}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleNavigate(schedule.id)}
                    startIcon={<NavigationIcon />}
                  >
                    Navigate
                  </Button>
                  <IconButton
                    size="small"
                    color="secondary"
                    onClick={() => handleDeleteClass(schedule.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure you want to delete this class?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={confirmDeleteClass} color="secondary" autoFocus>
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Snackbar */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={() => setSnackbarOpen(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setSnackbarOpen(false)}
            severity="success"
            sx={{ width: '100%' }}
          >
            Class added successfully!
          </Alert>
        </Snackbar>

        {/* Error Snackbar */}
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={() => setErrorMessage('')} severity="error" sx={{ width: '100%' }}>
            {errorMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
}

export default SchedulePage;
