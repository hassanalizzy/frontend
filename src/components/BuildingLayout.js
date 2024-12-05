import React from 'react';
import { Typography, Container } from '@mui/material';

function BuildingLayout({ classroom }) {
  const floorNumber = getFloorNumber(classroom.room_number);
  const imageUrl = getImageUrl(classroom.building.name, floorNumber);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {classroom.building.name} - Floor {floorNumber}
      </Typography>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={`Floor ${floorNumber} Layout`}
          style={{ width: '100%', maxWidth: '600px' }}
        />
      ) : (
        <Typography variant="body1">Floor plan not available.</Typography>
      )}
    </Container>
  );
}

const getFloorNumber = (roomNumber) => {
  if (!roomNumber || roomNumber.length === 0) return 'Unknown';
  const firstChar = roomNumber.charAt(0);
  if (isNaN(firstChar)) {
    return 'Unknown';
  }
  return firstChar;
};

const getImageUrl = (buildingName, floorNumber) => {
  // Map building names and floor numbers to image URLs
  // images are stored in the public/images folder

  // Format the building name to match the image file naming
  const formattedBuildingName = buildingName.replace(/\s+/g, '_').toLowerCase();

  // Construct the image URL
  return `/images/${formattedBuildingName}_floor_${floorNumber}.jpg`;
};

export default BuildingLayout;