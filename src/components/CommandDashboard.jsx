import React, { useState } from 'react';
import { Box, Paper, Typography, Button, TextField, Grid, Badge, Divider, Chip, Slider, Stack } from '@mui/material';
import { useUAVStore } from '../store/uavStore';

const CommandDashboard = () => {
  const { 
    position, rotation, speed, altitude, lateralMovement, 
    setSpeed, setAltitude, setLateralMovement, setRotation,
    setPosition, isThermalVision, setThermalVision, targets,
    toCesiumCoords
  } = useUAVStore();
  const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });

  const handleCoordinateSubmit = () => {
    let x = parseFloat(coordinates.x);
    let y = parseFloat(coordinates.y);
    let z = parseFloat(coordinates.z);
    
    if (!isNaN(x) && !isNaN(y) && !isNaN(z)) {
      // Limit coordinates for reasonable Cesium bounds
      x = Math.min(Math.max(x, -0.5), 0.5); // Longitude offset
      y = Math.min(Math.max(y, 50), 2000);   // Altitude in meters
      z = Math.min(Math.max(z, -0.5), 0.5);  // Latitude offset
      
      // Convert to Cesium coordinates (longitude, altitude, latitude)
      const cesiumCoords = [
        -122.4194 + x, // Base longitude + offset
        y,              // Altitude
        37.7749 + z     // Base latitude + offset
      ];
      
      useUAVStore.setState({ targetPosition: cesiumCoords });
      console.log("UAV moving to Cesium position:", cesiumCoords);
    } else {
      console.warn("Invalid coordinates. Please enter valid numbers.");
    }
  };

  const targetCounts = (targets || []).reduce((acc, target) => {
    acc[target.type] = (acc[target.type] || 0) + 1;
    return acc;
  }, {});

  const toggleThermalVision = () => {
    setThermalVision(!isThermalVision);
  };

  const validateCoordinate = (value, axis) => {
    if (value === '' || value === '-') return value;
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '';
    
    switch(axis) {
      case 'x': // Longitude offset
      case 'z': // Latitude offset
        return (numValue < -0.5) ? -0.5 : (numValue > 0.5 ? 0.5 : numValue);
      case 'y': // Altitude
        return (numValue < 50) ? 50 : (numValue > 2000 ? 2000 : numValue);
      default:
        return numValue;
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Command Dashboard
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          UAV Controls (Cesium Coordinates)
        </Typography>
        <Grid container spacing={1}>
          <Grid item xs={4}>
            <TextField
              label="Lon Offset"
              type="number"
              value={coordinates.x}
              onChange={(e) => setCoordinates(prev => ({ ...prev, x: validateCoordinate(e.target.value, 'x') }))}
              size="small"
              fullWidth
              helperText="±0.5°"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Altitude"
              type="number"
              value={coordinates.y}
              onChange={(e) => setCoordinates(prev => ({ ...prev, y: e.target.value }))}
              onBlur={(e) => {
                const validatedValue = validateCoordinate(e.target.value, 'y');
                setCoordinates(prev => ({ ...prev, y: validatedValue }));
              }}
              size="small"
              fullWidth
              helperText="50-2000m"
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Lat Offset"
              type="number"
              value={coordinates.z}
              onChange={(e) => setCoordinates(prev => ({ ...prev, z: validateCoordinate(e.target.value, 'z') }))}
              size="small"
              fullWidth
              helperText="±0.5°"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          onClick={handleCoordinateSubmit}
          sx={{ mt: 1 }}
          fullWidth
        >
          SET TARGET POSITION
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          UAV Current Position:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Lon: {position[0]?.toFixed(6)}° Alt: {position[1]?.toFixed(0)}m Lat: {position[2]?.toFixed(6)}°
        </Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="subtitle2" color="text.secondary">
          Altitude: {position[1]?.toFixed(0)}m above sea level
        </Typography>
        <Typography variant="subtitle2" color="text.secondary">
          Ground Speed: 35 km/h
        </Typography>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Vision Controls
        </Typography>
        <Button
          variant="contained"
          color={isThermalVision ? 'error' : 'primary'}
          onClick={toggleThermalVision}
          fullWidth
          sx={{ mb: 1 }}
        >
          {isThermalVision ? 'DISABLE THERMAL VISION' : 'ENABLE THERMAL VISION'}
        </Button>
        
        {isThermalVision && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(255, 200, 0, 0.1)', borderRadius: 1, border: '1px solid #ff9800' }}>
            <Typography variant="caption" color="#ff9800">
              THERMAL IMAGING ACTIVE
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Temperature Range: -20°C to 150°C
            </Typography>
            <Typography variant="caption" display="block" color="text.secondary">
              Detection Range: Enhanced (2x)
            </Typography>
          </Box>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Detected Targets {Array.isArray(targets) && targets.length > 0 &&
            <Badge badgeContent={targets?.length} color="error" sx={{ ml: 1 }} />
          }
        </Typography>
        
        {Object.entries(targetCounts).length > 0 && (
          <Box sx={{ mb: 2, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1, color: '#fff' }}>
            <Typography variant="body2">
              Target Summary:
            </Typography>
            {Object.entries(targetCounts).map(([type, count]) => (
              <Typography key={type} variant="body2">
                {type.charAt(0).toUpperCase() + type.slice(1)}: {count}
              </Typography>
            ))}
          </Box>
        )}

        {(targets && targets.length > 0) ? targets.map((target) => (
          <Paper key={target.id} sx={{ 
            p: 1, 
            mb: 1, 
            bgcolor: 
              target.type === 'tank' ? '#ffebee' : 
              target.type === 'jeep' ? '#e8f5e9' : 
              target.type === 'warehouse' ? '#fff3e0' : '#e3f2fd',
            color: '#000'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#000' }}>
                {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
              </Typography>
              <Chip 
                label={target.type === 'tank' ? 'Vehicle' : 
                      target.type === 'warehouse' ? 'Structure' : 'Vehicle'} 
                size="small" 
                sx={{ color: '#000', borderColor: '#000' }}
                variant="outlined"
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#000' }}>
              Position: ({target.position.map(p => p.toFixed(1)).join(', ')})
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.75rem', color: '#000' }}>
              Distance: {Math.sqrt(
                Math.pow(target.position[0] - position[0], 2) +
                Math.pow(target.position[1] - position[1], 2) +
                Math.pow(target.position[2] - position[2], 2)
              ).toFixed(2)} units
            </Typography>
          </Paper>
        )) : (
          <Typography variant="body2" color="black" sx={{ fontStyle: 'italic' }}>
            No targets detected. Fly the UAV closer to objects to detect them.
          </Typography>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />
    </Paper>
  );
};

export default CommandDashboard;