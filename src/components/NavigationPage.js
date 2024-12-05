// frontend/src/components/NavigationPage.js

import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
  GoogleMap,
  DirectionsRenderer,
  Marker,
  useLoadScript,
} from '@react-google-maps/api';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import parse from 'html-react-parser';
import BuildingLayout from './BuildingLayout';
import SatelliteIcon from '@mui/icons-material/Satellite';
import MapIcon from '@mui/icons-material/Map';

function NavigationPage() {
  const { classId } = useParams();
  const [classInfo, setClassInfo] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [previousLocation, setPreviousLocation] = useState(null);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [destination, setDestination] = useState(null);
  const [hasArrived, setHasArrived] = useState(false);
  const [watchId, setWatchId] = useState(null);
  const [turnMarkers, setTurnMarkers] = useState([]);
  const [steps, setSteps] = useState([]);
  const [mapType, setMapType] = useState('roadmap');
  const mapRef = useRef(null);
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry'],
  });

  useEffect(() => {
    fetchClassInfo();
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoaded && classInfo) {
      getUserLocation();
      setDestination({
        lat: classInfo.classroom.latitude,
        lng: classInfo.classroom.longitude,
      });
    }
  }, [isLoaded, classInfo]);

  useEffect(() => {
    if (userLocation && destination && isLoaded) {
      calculateRoute(userLocation, destination);
      checkArrival();
    }
  }, [userLocation, destination, isLoaded]);

  const fetchClassInfo = () => {
    axios
      .get(`http://localhost:8000/api/schedules/${classId}/`, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
        },
      })
      .then((response) => {
        setClassInfo(response.data);
      })
      .catch((error) => {
        console.error('Error fetching class info', error);
      });
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setPreviousLocation(userLocation);
          setUserLocation(newLocation);
        },
        (error) => {
          console.error('Error getting user location', error);
          alert('Could not get your location. Please enable location services.');
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: Infinity,
        }
      );
      setWatchId(id);
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  const calculateRoute = (origin, destination) => {
    if (window.google && window.google.maps) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);

            // Extract turn markers
            const markers = [];
            const stepsData = [];
            const steps = result.routes[0].legs[0].steps;

            steps.forEach((step) => {
              // Add steps for written directions
              stepsData.push(step);

              if (step.maneuver && step.maneuver.includes('turn')) {
                const rotation = window.google.maps.geometry.spherical.computeHeading(
                  step.start_location,
                  step.end_location
                );

                const marker = {
                  position: step.start_location,
                  icon: {
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 4,
                    strokeColor: '#0000FF',
                    rotation: rotation,
                  },
                };
                markers.push(marker);
              }
            });

            setTurnMarkers(markers);
            setSteps(stepsData); // Set steps for written directions
          } else {
            console.error(`Error fetching directions ${result}`);
            alert('Could not calculate route. Please try again.');
          }
        }
      );
    } else {
      console.error('Google Maps API is not loaded yet.');
    }
  };

  const checkArrival = () => {
    if (userLocation && destination) {
      const distance = getDistanceFromLatLonInMeters(
        userLocation.lat,
        userLocation.lng,
        destination.lat,
        destination.lng
      );

      if (distance <= 50) {
        setHasArrived(true);
        if (watchId) {
          navigator.geolocation.clearWatch(watchId);
        }
      }
    }
  };

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    function deg2rad(deg) {
      return (deg * Math.PI) / 180;
    }
    const R = 6371e3; // Earth's radius in meters
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  const checkDeviation = () => {
    if (directionsResponse && userLocation) {
      const path = directionsResponse.routes[0].overview_path;
      const location = new window.google.maps.LatLng(userLocation.lat, userLocation.lng);
      const isOnPath = window.google.maps.geometry.poly.isLocationOnEdge(
        location,
        path,
        0.0005
      ); // Approx 50 meters tolerance

      if (!isOnPath) {
        calculateRoute(userLocation, destination);
      }
    }
  };

  useEffect(() => {
    if (userLocation && directionsResponse && isLoaded) {
      checkDeviation();
    }
  }, [userLocation]);

  const mapContainerStyle = {
    height: '100vh',
    width: '100%',
  };

  const mapOptions = {
    tilt: 45,
    heading: 0,
    mapTypeId: mapType,
    zoom: 18,
    center: userLocation || { lat: 34.0522, lng: -118.2437 },
    rotateControl: false,
    streetViewControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
  };

  const onLoad = (mapInstance) => {
    mapRef.current = mapInstance;
    mapInstance.setTilt(45);
  };

  useEffect(() => {
    if (mapRef.current && userLocation) {
      mapRef.current.panTo(userLocation);

      if (previousLocation) {
        const heading = window.google.maps.geometry.spherical.computeHeading(
          new window.google.maps.LatLng(previousLocation.lat, previousLocation.lng),
          new window.google.maps.LatLng(userLocation.lat, userLocation.lng)
        );
        mapRef.current.setHeading(heading);
      }
    }
  }, [userLocation]);

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading Maps...</div>;
  }

  return (
    <div>
      {hasArrived ? (
        <BuildingLayout classroom={classInfo.classroom} />
      ) : (
        <Box sx={{ position: 'relative' }}>
          {/* Map Type Toggle */}
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1,
              backgroundColor: 'white',
              borderRadius: 1,
              padding: 1,
            }}
          >
            <ToggleButtonGroup
              value={mapType}
              exclusive
              onChange={(event, newType) => {
                if (newType !== null) {
                  setMapType(newType);
                }
              }}
            >
              <ToggleButton value="roadmap" aria-label="Roadmap">
                <MapIcon />
              </ToggleButton>
              <ToggleButton value="satellite" aria-label="Satellite">
                <SatelliteIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Directions Overlay */}
          <Box
            sx={{
              position: 'absolute',
              top: 70,
              left: 10,
              right: 10,
              zIndex: 1,
              backgroundColor: 'rgba(255, 0, 0, 0.6)',
              borderRadius: 1,
              padding: 1,
              maxHeight: '30vh',
              overflowY: 'auto',
            }}
          >
            <Typography variant="h6" sx={{ color: 'white' }}>
            Directions</Typography>
            <List>
              {steps.map((step, index) => (
                <ListItem key={index}>
                  <ListItemText
                    primary={parse(step.instructions)}
                    secondary={`Distance: ${step.distance.text}, Duration: ${step.duration.text}`}
                    sx={{
                      '& *': {
                        color: 'white',
                      },
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          {/* Map Container */}
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            options={mapOptions}
            onLoad={onLoad}
          >
            {directionsResponse && (
              <DirectionsRenderer
                directions={directionsResponse}
                options={{
                  polylineOptions: {
                    strokeColor: '#FF0000',
                    strokeWeight: 6,
                  },
                  suppressMarkers: true,
                }}
              />
            )}
            {turnMarkers.map((marker, index) => (
              <Marker key={index} position={marker.position} icon={marker.icon} />
            ))}
            {userLocation && (
              <Marker
                position={userLocation}
                icon={{
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 6,
                  fillColor: '#00BFFF',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2,
                }}
              />
            )}
          </GoogleMap>
        </Box>
      )}
    </div>
  );
}

export default NavigationPage;
