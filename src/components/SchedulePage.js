import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Autocomplete,
  CircularProgress,
  TextField,
  Button,
  Fab,
  Slide,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import NavigationIcon from '@mui/icons-material/Navigation';
import AddIcon from '@mui/icons-material/Add';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchSchedules = useCallback(() => {
    axios
      .get('http://localhost:8000/api/schedules/', {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('Schedules fetched:', data);
        setSchedules(data);
      })
      .catch((error) => {
        console.error('Error fetching schedules', error);
        setErrorMessage('Failed to fetch schedules.');
      });
  }, []);

  const fetchBuildings = useCallback(() => {
    axios
      .get('http://localhost:8000/api/buildings/')
      .then((response) => {
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('Buildings fetched:', data);
        setBuildings(data);
      })
      .catch((error) => {
        console.error('Error fetching buildings', error);
        setErrorMessage('Failed to fetch buildings.');
      });
  }, []);

  const fetchClassrooms = useCallback((buildingId) => {
    console.log('Fetching classrooms for building_id:', buildingId);
    setLoadingClassrooms(true);
    axios
      .get(`http://localhost:8000/api/classrooms/?building_id=${buildingId}`)
      .then((response) => {
        console.log('Raw classrooms response:', response.data);
        // We expect response.data to be an array of classrooms since we disabled pagination
        const data = Array.isArray(response.data) ? response.data : [];
        console.log('Classrooms array parsed:', data);
        setClassrooms(data);
        setLoadingClassrooms(false);

        if (data.length === 0) {
          console.warn('No classrooms returned for this building. Check database entries.');
        }
      })
      .catch((error) => {
        console.error('Error fetching classrooms', error);
        setErrorMessage('Failed to fetch classrooms.');
        setLoadingClassrooms(false);
      });
  }, []);

  useEffect(() => {
    fetchSchedules();
    fetchBuildings();
  }, [fetchSchedules, fetchBuildings]);

  useEffect(() => {
    console.log('Selected building changed:', building);
    if (building && building.id) {
      console.log('Building has an id:', building.id);
      fetchClassrooms(building.id);
    } else {
      console.log('No building selected or building has no id.');
      setClassrooms([]);
      setClassroom(null);
    }
  }, [building, fetchClassrooms]);

  const handleAddClass = () => {
    if (!building || !classroom) {
      alert('Please select a building and classroom.');
      return;
    }
    console.log('Adding class:', { className, building, classroom, classTime });
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
        console.log('Class added successfully.');
        fetchSchedules();
        setClassName('');
        setBuilding(null);
        setClassroom(null);
        setClassTime('');
        setSnackbarOpen(true);
        setAddDialogOpen(false);
      })
      .catch((error) => {
        console.error('Error adding class', error);
        setErrorMessage('Failed to add class. Please try again.');
      });
  };

  const handleNavigate = (classId) => {
    console.log('Navigating to class:', classId);
    navigate(`/navigate/${classId}`);
  };

  const handleDeleteClass = (classId) => {
    console.log('Deleting class:', classId);
    setClassToDelete(classId);
  };

  const confirmDeleteClass = () => {
    console.log('Confirm deleting class:', classToDelete);
    axios
      .delete(`http://localhost:8000/api/schedules/${classToDelete}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then(() => {
        console.log('Class deleted.');
        fetchSchedules();
        setClassToDelete(null);
      })
      .catch((error) => {
        console.error('Error deleting class', error);
        setErrorMessage('Failed to delete class.');
      });
  };

  const isAddClassDisabled = !className || !building || !classroom || !classTime;

  return (
    <>
      <AppBar position="static" elevation={0} sx={{ backgroundColor: '#fff', color: '#000' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
            Your Schedule
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 2, pb: 8 }}>
        <Grid container spacing={2}>
          {schedules.map((schedule) => (
            <Grid item xs={12} sm={6} md={4} key={schedule.id}>
              <Card
                elevation={1}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: '#f9f9f9',
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 500 }}>
                    {schedule.class_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {schedule.classroom.building.name} - Room {schedule.classroom.room_number}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {schedule.class_time}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<NavigationIcon />}
                    onClick={() => handleNavigate(schedule.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Navigate
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClass(schedule.id)}
                    sx={{ borderRadius: 2 }}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Floating Action Button to Add a Class */}
        <Fab
          color="primary"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setAddDialogOpen(true)}
        >
          <AddIcon />
        </Fab>

        {/* Dialog for Adding a Class */}
        <Dialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          TransitionComponent={Transition}
          keepMounted
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 600 }}>Add Class</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <TextField
                label="Class Name"
                variant="filled"
                fullWidth
                margin="normal"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />

              <Autocomplete
                options={Array.isArray(buildings) ? buildings : []}
                getOptionLabel={(option) => option.name || ''}
                value={building}
                onChange={(event, newValue) => {
                  console.log('Selected building:', newValue);
                  setBuilding(newValue);
                  setClassroom(null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Building"
                    variant="filled"
                    fullWidth
                    margin="normal"
                  />
                )}
                sx={{ mt: 2 }}
              />

              <Autocomplete
                options={Array.isArray(classrooms) ? classrooms : []}
                getOptionLabel={(option) => option.room_number || ''}
                value={classroom}
                onChange={(event, newValue) => {
                  console.log('Selected classroom:', newValue);
                  setClassroom(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Classroom"
                    variant="filled"
                    fullWidth
                    margin="normal"
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
                sx={{ mt: 2 }}
              />

              <TextField
                label="Class Time"
                variant="filled"
                type="time"
                InputLabelProps={{ shrink: true }}
                fullWidth
                margin="normal"
                value={classTime}
                onChange={(e) => setClassTime(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleAddClass}
              disabled={isAddClassDisabled}
              sx={{ borderRadius: 2 }}
            >
              Add
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={Boolean(classToDelete)}
          onClose={() => setClassToDelete(null)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 600 }}>Confirm Delete</DialogTitle>
          <DialogContent>
            Are you sure you want to delete this class?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setClassToDelete(null)}>Cancel</Button>
            <Button onClick={confirmDeleteClass} color="error" variant="contained" autoFocus sx={{ borderRadius: 2 }}>
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
      </Container>
    </>
  );
}

export default SchedulePage;
