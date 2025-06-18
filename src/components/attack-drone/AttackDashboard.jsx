// import React, { useState, useEffect } from 'react';
// import { Box, Paper, Typography, Button, Badge, Chip, Stack, LinearProgress, Divider, Alert, TextField, Grid } from '@mui/material';
// import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
// import FlightLandIcon from '@mui/icons-material/FlightLand';
// import GpsFixedIcon from '@mui/icons-material/GpsFixed';
// import MissileIcon from '@mui/icons-material/RocketLaunch';
// import HomeIcon from '@mui/icons-material/Home';
// import WarningIcon from '@mui/icons-material/Warning';
// import SecurityIcon from '@mui/icons-material/Security';
// import BlockIcon from '@mui/icons-material/Block';
// import { useUAVStore } from '../../store/uavStore';
// import { useAttackDroneStore } from '../../store/attackDroneStore';
// import LockOnProgress from './LockOnProgress';
// import DamageAssessment from './DamageAssessment';

// // Define constants for clarity
// const MIN_SAFE_ALTITUDE = 20;
// const RADAR_RADIUS = 50; // Detection range

// const AttackDashboard = () => {
//   const { position, setPosition } = useUAVStore();
//   const { 
//     selectedWeapon, 
//     ammoCount, 
//     targeting,
//     missionState,
//     homeBase,
//     attackPosition,
//     selectWeapon, 
//     beginTargetLock, 
//     fireMissile,
//     returnToBase,
//     targets,
//     droneHealth,
//     damageEffects,
//     communicationsJammed,
//     targetingJammed
//   } = useAttackDroneStore();
  
//   // State for coordinate input fields
//   const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });
//   // State for defense system detection
//   const [isDefenseSystemDetected, setIsDefenseSystemDetected] = useState(false);
  
//   // Check if UAV is in defense system range and above minimum altitude
//   useEffect(() => {
//     if (!position) return;
    
//     // Get UAV position and calculate if it's within defense range
//     const warehousePos = [40, 20, 35]; // Warehouse position where defense system is
    
//     const distance = Math.sqrt(
//       Math.pow(warehousePos[0] - position[0], 2) +
//       Math.pow(warehousePos[2] - position[2], 2) // Only check X-Z plane distance
//     );
    
//     const uavAltitude = position[1];
    
//     // Detect if UAV is within range and above minimum altitude
//     const detected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
//     setIsDefenseSystemDetected(detected);
    
//   }, [position]);
  
//   // Handle moving to coordinates then preparing to fire
//   const handleCoordinateSubmit = () => {
//     // Parse and validate input values
//     const rawX = parseFloat(coordinates.x);
//     const rawY = parseFloat(coordinates.y);
//     const rawZ = parseFloat(coordinates.z);
    
//     // Check if they are valid numbers
//     if (isNaN(rawX) || isNaN(rawY) || isNaN(rawZ)) {
//       console.warn("Invalid coordinate values. Please enter numbers.");
//       return;
//     }
    
//     // Apply limits for coordinates
//     const x = Math.min(Math.max(rawX, -50), 50);
//     const y = Math.min(Math.max(rawY, 10), 100);
//     const z = Math.min(Math.max(rawZ, -50), 50);
    
//     // Update the input fields with validated values
//     setCoordinates({
//       x: x.toString(),
//       y: y.toString(),
//       z: z.toString()
//     });
    
//     // Set the target position and initiate movement
//     useAttackDroneStore.getState().moveToPosition([x, y, z]);
//     console.log("UAV moving to position:", [x, y, z]);
//   };
  
//   // Handle target selection
//   const handleSelectTarget = (targetId) => {
//     if (missionState !== 'attacking') {
//       console.log("Cannot select target - UAV must be in attack position");
//       return;
//     }
    
//     // Begin target lock process
//     console.log("Attempting to lock on target:", targetId);
    
//     // Find target in our list
//     const target = targets.find(t => t.id === targetId);
//     if (!target) return;
    
//     // Start with acquiring status
//     useAttackDroneStore.getState().setTargeting({
//       lockedTarget: targetId,
//       lockStatus: 'acquiring',
//       lockTimer: 0,
//       maxLockTime: 3000 // 3 seconds to lock
//     });
    
//     // Manual lock process simulation
//     const lockInterval = setInterval(() => {
//       const currentTargeting = useAttackDroneStore.getState().targeting;
      
//       // Update progress
//       if (currentTargeting.lockTimer >= currentTargeting.maxLockTime) {
//         // Lock complete
//         clearInterval(lockInterval);
//         useAttackDroneStore.getState().setTargeting({
//           ...currentTargeting,
//           lockStatus: 'locked',
//           lockTimer: currentTargeting.maxLockTime
//         });
//         console.log("Target locked successfully");
//       } else {
//         // Increment timer
//         useAttackDroneStore.getState().setTargeting({
//           ...currentTargeting,
//           lockTimer: currentTargeting.lockTimer + 100
//         });
//       }
//     }, 100);
//   };

//   // Calculate distance between UAV and target
//   const calculateDistance = (targetPosition) => {
//     if (!targetPosition || !position || targetPosition.length < 3 || position.length < 3) {
//       return 0;
//     }
//     return Math.sqrt(
//       Math.pow(targetPosition[0] - position[0], 2) +
//       Math.pow(targetPosition[1] - position[1], 2) +
//       Math.pow(targetPosition[2] - position[2], 2)
//     ).toFixed(2);
//   };
  
//   // Handle coordinate input changes
//   const handleCoordinateChange = (axis, value) => {
//     // Just update the state with whatever the user types - no immediate validation
//     setCoordinates({
//       ...coordinates,
//       [axis]: value
//     });
//   };
  
//   // Then in the same file, add this function for validating on blur
//   const handleCoordinateBlur = (axis) => {
//     const value = coordinates[axis];
    
//     // Skip validation for empty values
//     if (value === '' || value === '-') return;
    
//     const numValue = parseFloat(value);
    
//     // Skip validation if not a number
//     if (isNaN(numValue)) return;
    
//     let validatedValue;
    
//     // Apply limits based on axis
//     switch(axis) {
//       case 'x':
//       case 'z':
//         validatedValue = Math.min(Math.max(numValue, -50), 50);
//         break;
//       case 'y':
//         validatedValue = Math.min(Math.max(numValue, 10), 100);
//         break;
//       default:
//         validatedValue = numValue;
//     }
    
//     // Only update if the validated value is different from the input
//     if (validatedValue !== numValue) {
//       setCoordinates(prev => ({
//         ...prev,
//         [axis]: validatedValue.toString()
//       }));
//     }
//   };
  
//   // Get mission status information
//   const getMissionStatusInfo = () => {
//     switch(missionState) {
//       case 'moving':
//         return {
//           label: 'MOVING TO ATTACK POSITION',
//           color: '#ff9800',
//           icon: <FlightTakeoffIcon />,
//           description: 'Flying to optimal attack position'
//         };
//       case 'attacking':
//         return {
//           label: 'ATTACK POSITION REACHED',
//           color: '#f44336',
//           icon: <MissileIcon />,
//           description: 'Ready to engage target'
//         };
//       case 'returning':
//         return {
//           label: 'RETURNING TO BASE',
//           color: '#2196f3',
//           icon: <FlightLandIcon />,
//           description: 'Mission complete, returning home'
//         };
//       case 'crashed':
//         return {
//           label: 'DRONE CRASHED',
//           color: '#d32f2f',  // deep red
//           icon: <WarningIcon />,
//           description: 'UAV destroyed by defense systems'
//         };
//       default:
//         return {
//           label: 'STANDBY',
//           color: '#757575',
//           icon: <HomeIcon />,
//           description: 'Ready for mission assignment'
//         };
//     }
//   };
  
//   const missionStatus = getMissionStatusInfo();
  
//   // Handle anti-drone defensive system attack on UAV
//   const handleAntiDroneAttack = () => {
//     // Only works if UAV is detected (above MIN_SAFE_ALTITUDE and in range)
//     if (isDefenseSystemDetected) {
//       // Destroy the UAV - set health to 0 and trigger destroyed state
//       useAttackDroneStore.getState().setDroneDamage({ 
//         type: 'hit', 
//         damage: 100 // Full damage to destroy
//       });
//       console.log("Anti-drone defense system destroyed the UAV!");
//     }
//   };
  
//   return (
//     <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
//       <Typography variant="h6" gutterBottom>
//         Attack Drone Command
//       </Typography>
      
//       {/* Add Coordinate Controls */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" gutterBottom>
//           UAV Position Controls
//         </Typography>
//         <Grid container spacing={2}>
//           <Grid item xs={4}>
//             <TextField
//               label="X"
//               type="number"
//               value={coordinates.x}
//               onChange={(e) => handleCoordinateChange('x', e.target.value)}
//               onBlur={() => handleCoordinateBlur('x')}
//               size="small"
//               fullWidth
//               placeholder="X (-50 to 50)"
//               // Remove the inputProps that restrict input
//               // inputProps={{ min: -50, max: 50 }}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Y"
//               type="number"
//               value={coordinates.y}
//               onChange={(e) => handleCoordinateChange('y', e.target.value)}
//               onBlur={() => handleCoordinateBlur('y')}
//               size="small"
//               fullWidth
//               placeholder="Y (10 to 100)"
//               // Remove the inputProps that restrict input
//               // inputProps={{ min: 10, max: 100 }}
//               helperText={parseFloat(coordinates.y) < MIN_SAFE_ALTITUDE ? "Stealth" : ""}
//             />
//           </Grid>
//           <Grid item xs={4}>
//             <TextField
//               label="Z"
//               type="number"
//               value={coordinates.z}
//               onChange={(e) => handleCoordinateChange('z', e.target.value)}
//               onBlur={() => handleCoordinateBlur('z')}
//               size="small"
//               fullWidth
//               placeholder="Z (-50 to 50)"
//               // Remove the inputProps that restrict input
//               // inputProps={{ min: -50, max: 50 }}
//             />
//           </Grid>
//           <Grid item xs={12}>
//             <Button 
//               variant="contained" 
//               onClick={handleCoordinateSubmit} 
//               fullWidth
//               disabled={missionState !== 'idle'}
//             >
//               Set Position
//             </Button>
//           </Grid>
//           <Grid item xs={12}>
//             <Typography variant="caption" color="text.secondary">
//               Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}
//               {position && position[1] < MIN_SAFE_ALTITUDE && (
//                 <Chip
//                   label="STEALTH MODE"
//                   size="small"
//                   color="success"
//                   sx={{ ml: 1, height: 20 }}
//                 />
//               )}
//             </Typography>
//           </Grid>
//         </Grid>
//       </Box>
      
//       {/* Mission Status */}
//       <Box sx={{ mb: 3, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//           <Box sx={{ mr: 1, color: missionStatus.color }}>{missionStatus.icon}</Box>
//           <Typography variant="subtitle1" color={missionStatus.color} fontWeight="bold">
//             {missionStatus.label}
//           </Typography>
//         </Box>
//         <Typography variant="body2" color="text.secondary">
//           {missionStatus.description}
//         </Typography>
        
//         {/* Position information */}
//         <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
//           <div>Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}</div>
//           {missionState === 'moving' && attackPosition && (
//             <div>Target: [{attackPosition.map(n => Math.floor(n)).join(', ')}]</div>
//           )}
//           {missionState === 'returning' && homeBase && (
//             <div>Base: [{homeBase.map(n => Math.floor(n)).join(', ')}]</div>
//           )}
//         </Box>
        
//         {/* Return to base button */}
//         {(missionState === 'attacking' || missionState === 'moving') && (
//           <Button 
//             variant="outlined" 
//             size="small"
//             startIcon={<HomeIcon />}
//             onClick={returnToBase}
//             sx={{ mt: 1 }}
//           >
//             Return To Base
//           </Button>
//         )}
//       </Box>

//       {/* Weapons System */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" gutterBottom>
//           Weapons System
//         </Typography>
//         <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
//           <Button 
//             variant="contained"
//             color={selectedWeapon === 'missile' ? 'primary' : 'inherit'}
//             onClick={() => selectWeapon('missile')}
//             disabled={missionState !== 'idle' && missionState !== 'attacking'}
//             sx={{ 
//               bgcolor: selectedWeapon === 'missile' ? '#90caf9' : 'transparent',
//               '&:hover': { bgcolor: selectedWeapon === 'missile' ? '#64b5f6' : '#424242' }
//             }}
//           >
//             MISSILES
//             <Badge 
//               badgeContent={ammoCount.missile} 
//               color="error"
//               sx={{ ml: 1 }}
//             />
//           </Button>
//           <Button 
//             variant="contained"
//             color={selectedWeapon === 'bomb' ? 'primary' : 'inherit'}
//             onClick={() => selectWeapon('bomb')}
//             disabled={missionState !== 'idle' && missionState !== 'attacking'}
//             sx={{ 
//               bgcolor: selectedWeapon === 'bomb' ? '#90caf9' : 'transparent',
//               '&:hover': { bgcolor: selectedWeapon === 'bomb' ? '#64b5f6' : '#424242' }
//             }}
//           >
//             BOMBS
//             <Badge 
//               badgeContent={ammoCount.bomb} 
//               color="error"
//               sx={{ ml: 1 }}
//             />
//           </Button>
//         </Stack>
//       </Box>
      
//       {/* Target Acquisition */}
//       <Box sx={{ mb: 3 }}>
//         <Typography variant="subtitle1" gutterBottom>
//           Target Acquisition
//         </Typography>
        
//         {targeting.lockStatus !== 'inactive' && (
//           <Box sx={{ mb: 2 }}>
//             <Typography variant="subtitle2">Lock Status:</Typography>
//             <LockOnProgress 
//               status={targeting.lockStatus} 
//               progress={targeting.lockTimer / targeting.maxLockTime} 
//             />
//           </Box>
//         )}
        
//         {/* Fire Control - only enabled when at attack position with locked target */}
//         <Button
//           variant="contained"
//           color="error"
//           fullWidth
//           disabled={
//             missionState !== 'attacking' || 
//             targeting.lockStatus !== 'locked' || 
//             ammoCount[selectedWeapon] <= 0
//           }
//           onClick={() => {
//             console.log("Fire button clicked");
//             console.log("Mission state:", missionState);
//             console.log("Lock status:", targeting.lockStatus);
//             console.log("Selected weapon:", selectedWeapon);
//             console.log("Ammo count:", ammoCount[selectedWeapon]);
            
//             // Call fireMissile directly from the store to ensure we're using the latest state
//             useAttackDroneStore.getState().fireMissile();
//           }}
//           startIcon={<MissileIcon />}
//           sx={{ mb: 2 }}
//         >
//           FIRE {selectedWeapon.toUpperCase()}
//         </Button>
        
//         {/* Target list */}
//         <Typography variant="subtitle2" gutterBottom>
//           Available Targets:
//         </Typography>
        
//         {Array.isArray(targets) && targets.length > 0 ? (
//           targets.map((target) => (
//             <div 
//               key={target.id} 
//               style={{ 
//                 padding: '8px',
//                 marginBottom: '8px',
//                 backgroundColor: targeting.lockedTarget === target.id ? '#ffebee' : '#f5f5f5',
//                 border: targeting.lockedTarget === target.id ? '1px solid #f44336' : 'none',
//                 borderRadius: '4px',
//                 cursor: missionState === 'attacking' ? 'pointer' : 'default',
//                 opacity: missionState === 'attacking' ? 1 : 0.7
//               }}
//               onClick={() => missionState === 'attacking' && handleSelectTarget(target.id)}
//             >
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                 <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
//                   {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
//                 </Typography>
//                 <Chip 
//                   label={targeting.lockedTarget === target.id ? 'LOCKED' : 'SELECT'} 
//                   size="small" 
//                   color={targeting.lockedTarget === target.id ? 'error' : 'default'}
//                   variant="outlined"
//                   disabled={missionState !== 'attacking'}
//                   icon={<GpsFixedIcon fontSize="small" />}
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     if (missionState === 'attacking') {
//                       handleSelectTarget(target.id);
//                     }
//                   }}
//                 />
//               </Box>
//               <Typography variant="body2" color='black'>
//                 Distance: {calculateDistance(target.position)} m
//               </Typography>
//             </div>
//           ))
//         ) : (
//           <Typography variant="body2" color="text.secondary">
//             No targets detected in range.
//           </Typography>
//         )}
//       </Box>

//       {/* Damage Assessment */}
//       <DamageAssessment />

//       {/* Defense System Warning */}
//       {isDefenseSystemDetected && (
//         <Box sx={{ 
//           mb: 2, 
//           p: 1, 
//           bgcolor: 'rgba(255,0,0,0.15)', 
//           borderRadius: 1,
//           border: '1px solid #f44336'
//         }}>
//           <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//             <WarningIcon color="error" sx={{ mr: 1 }} />
//             <Typography variant="subtitle1" color="error" fontWeight="bold">
//               DEFENSE SYSTEM DETECTED
//             </Typography>
//           </Box>
//           <Typography variant="body2" color="text.secondary">
//             Anti-aircraft defenses operational. Fly below {MIN_SAFE_ALTITUDE}m altitude to avoid detection.
//           </Typography>
//           {droneHealth < 100 && (
//             <LinearProgress
//               variant="determinate"
//               value={droneHealth}
//               sx={{ 
//                 mt: 1, 
//                 height: 10, 
//                 borderRadius: 1,
//                 backgroundColor: 'rgba(255,255,255,0.2)',
//                 '& .MuiLinearProgress-bar': {
//                   backgroundColor: droneHealth > 70 ? '#4caf50' : 
//                                   droneHealth > 30 ? '#ff9800' : '#f44336'
//                 }
//               }}
//             />
//           )}
          
//           {/* Anti-Drone Attack Button */}
//           <Button
//             variant="contained"
//             color="error"
//             fullWidth
//             sx={{ mt: 1 }}
//             onClick={handleAntiDroneAttack}
//           >
//             ACTIVATE DEFENSE SYSTEM
//           </Button>
//         </Box>
//       )}

//       {/* System Malfunction Warnings */}
//       {communicationsJammed && (
//         <Alert 
//           severity="error" 
//           icon={<BlockIcon />}
//           sx={{ mb: 2 }}
//         >
//           COMMUNICATIONS JAMMED - Control systems impaired
//         </Alert>
//       )}

//       {targetingJammed && (
//         <Alert 
//           severity="error"
//           icon={<BlockIcon />} 
//           sx={{ mb: 2 }}
//         >
//           TARGETING SYSTEMS JAMMED - Weapons systems offline
//         </Alert>
//       )}
//     </Paper>
//   );
// };

// export default AttackDashboard;


import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Button, Badge, Chip, Stack, LinearProgress, Divider, Alert, TextField, Grid } from '@mui/material';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import FlightLandIcon from '@mui/icons-material/FlightLand';
import GpsFixedIcon from '@mui/icons-material/GpsFixed';
import MissileIcon from '@mui/icons-material/RocketLaunch';
import HomeIcon from '@mui/icons-material/Home';
import WarningIcon from '@mui/icons-material/Warning';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import LockOnProgress from './LockOnProgress';
import DamageAssessment from './DamageAssessment';

// Define constants for clarity
const MIN_SAFE_ALTITUDE = 20;
const RADAR_RADIUS = 50; // Detection range

const AttackDashboard = () => {
  const { position, setPosition } = useUAVStore();
  const {
    selectedWeapon,
    ammoCount,
    targeting,
    missionState,
    homeBase,
    attackPosition,
    selectWeapon,
    beginTargetLock,
    fireMissile,
    returnToBase,
    targets,
    droneHealth,
    damageEffects,
    communicationsJammed,
    targetingJammed
  } = useAttackDroneStore();

  // State for coordinate input fields
  const [coordinates, setCoordinates] = useState({ x: '', y: '', z: '' });
  // State for defense system detection
  const [isDefenseSystemDetected, setIsDefenseSystemDetected] = useState(false);

  // Check if UAV is in defense system range and above minimum altitude
  useEffect(() => {
    if (!position) return;

    // Get UAV position and calculate if it's within defense range
    const warehousePos = [40, 20, 35]; // Warehouse position where defense system is

    const distance = Math.sqrt(
      Math.pow(warehousePos[0] - position[0], 2) +
      Math.pow(warehousePos[2] - position[2], 2) // Only check X-Z plane distance
    );

    const uavAltitude = position[1];

    // Detect if UAV is within range and above minimum altitude
    const detected = distance < RADAR_RADIUS && uavAltitude > MIN_SAFE_ALTITUDE;
    setIsDefenseSystemDetected(detected);

  }, [position]);

  // Handle moving to coordinates then preparing to fire
  const handleCoordinateSubmit = () => {
    // Parse and validate input values
    const rawX = parseFloat(coordinates.x);
    const rawY = parseFloat(coordinates.y);
    const rawZ = parseFloat(coordinates.z);

    // Check if they are valid numbers
    if (isNaN(rawX) || isNaN(rawY) || isNaN(rawZ)) {
      console.warn("Invalid coordinate values. Please enter numbers.");
      return;
    }

    // Apply limits for coordinates
    const x = Math.min(Math.max(rawX, -50), 50);
    const y = Math.min(Math.max(rawY, 10), 100);
    const z = Math.min(Math.max(rawZ, -50), 50);

    // Update the input fields with validated values
    setCoordinates({
      x: x.toString(),
      y: y.toString(),
      z: z.toString()
    });

    // Set the target position and initiate movement
    useAttackDroneStore.getState().moveToPosition([x, y, z]);
    console.log("UAV moving to position:", [x, y, z]);
  };

  // Handle target selection
  const handleSelectTarget = (targetId) => {
    if (missionState !== 'attacking') {
      console.log("Cannot select target - UAV must be in attack position");
      return;
    }

    // Begin target lock process
    console.log("Attempting to lock on target:", targetId);

    // Find target in our list
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    // Start with acquiring status
    useAttackDroneStore.getState().setTargeting({
      lockedTarget: targetId,
      lockStatus: 'acquiring',
      lockTimer: 0,
      maxLockTime: 3000 // 3 seconds to lock
    });

    // Manual lock process simulation
    const lockInterval = setInterval(() => {
      const currentTargeting = useAttackDroneStore.getState().targeting;

      // Update progress
      if (currentTargeting.lockTimer >= currentTargeting.maxLockTime) {
        // Lock complete
        clearInterval(lockInterval);
        useAttackDroneStore.getState().setTargeting({
          ...currentTargeting,
          lockStatus: 'locked',
          lockTimer: currentTargeting.maxLockTime
        });
        console.log("Target locked successfully");
      } else {
        // Increment timer
        useAttackDroneStore.getState().setTargeting({
          ...currentTargeting,
          lockTimer: currentTargeting.lockTimer + 100
        });
      }
    }, 100);
  };

  // Calculate distance between UAV and target
  const calculateDistance = (targetPosition) => {
    if (!targetPosition || !position || targetPosition.length < 3 || position.length < 3) {
      return 0;
    }
    return Math.sqrt(
      Math.pow(targetPosition[0] - position[0], 2) +
      Math.pow(targetPosition[1] - position[1], 2) +
      Math.pow(targetPosition[2] - position[2], 2)
    ).toFixed(2);
  };

  // Handle coordinate input changes
  const handleCoordinateChange = (axis, value) => {
    // Just update the state with whatever the user types - no immediate validation
    setCoordinates({
      ...coordinates,
      [axis]: value
    });
  };

  // Then in the same file, add this function for validating on blur
  const handleCoordinateBlur = (axis) => {
    const value = coordinates[axis];

    // Skip validation for empty values
    if (value === '' || value === '-') return;

    const numValue = parseFloat(value);

    // Skip validation if not a number
    if (isNaN(numValue)) return;

    let validatedValue;

    // Apply limits based on axis
    switch (axis) {
      case 'x':
      case 'z':
        validatedValue = Math.min(Math.max(numValue, -50), 50);
        break;
      case 'y':
        validatedValue = Math.min(Math.max(numValue, 10), 100);
        break;
      default:
        validatedValue = numValue;
    }

    // Only update if the validated value is different from the input
    if (validatedValue !== numValue) {
      setCoordinates(prev => ({
        ...prev,
        [axis]: validatedValue.toString()
      }));
    }
  };

  // Get mission status information
  const getMissionStatusInfo = () => {
    switch (missionState) {
      case 'moving':
        return {
          label: 'MOVING TO ATTACK POSITION',
          color: '#ff9800',
          icon: <FlightTakeoffIcon />,
          description: 'Flying to optimal attack position'
        };
      case 'attacking':
        return {
          label: 'ATTACK POSITION REACHED',
          color: '#f44336',
          icon: <MissileIcon />,
          description: 'Ready to engage target'
        };
      case 'returning':
        return {
          label: 'RETURNING TO BASE',
          color: '#2196f3',
          icon: <FlightLandIcon />,
          description: 'Mission complete, returning home'
        };
      case 'crashed':
        return {
          label: 'DRONE CRASHED',
          color: '#d32f2f', // deep red
          icon: <WarningIcon />,
          description: 'UAV destroyed by defense systems'
        };
      default:
        return {
          label: 'STANDBY',
          color: '#757575',
          icon: <HomeIcon />,
          description: 'Ready for mission assignment'
        };
    }
  };

  const missionStatus = getMissionStatusInfo();

  // Handle anti-drone defensive system attack on UAV
  const handleAntiDroneAttack = () => {
    // Only works if UAV is detected (above MIN_SAFE_ALTITUDE and in range)
    if (isDefenseSystemDetected) {
      // Destroy the UAV - set health to 0 and trigger destroyed state
      useAttackDroneStore.getState().setDroneDamage({
        type: 'hit',
        damage: 100 // Full damage to destroy
      });
      console.log("Anti-drone defense system destroyed the UAV!");
    }
  };

  return (
    <Paper sx={{ p: 2, m: 2, maxWidth: 400 }}>
      <Typography variant="h6" gutterBottom>
        Attack Drone Command
      </Typography>

      {/* Add Coordinate Controls */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          UAV Position Controls
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <TextField
              label="X"
              type="number"
              value={coordinates.x}
              onChange={(e) => handleCoordinateChange('x', e.target.value)}
              onBlur={() => handleCoordinateBlur('x')}
              size="small"
              fullWidth
              placeholder="X (-50 to 50)"
            // Remove the inputProps that restrict input
            // inputProps={{ min: -50, max: 50 }}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Y"
              type="number"
              value={coordinates.y}
              onChange={(e) => handleCoordinateChange('y', e.target.value)}
              onBlur={() => handleCoordinateBlur('y')}
              size="small"
              fullWidth
              placeholder="Y (10 to 100)"
              // Remove the inputProps that restrict input
              // inputProps={{ min: 10, max: 100 }}
              helperText={parseFloat(coordinates.y) < MIN_SAFE_ALTITUDE ? "Stealth" : ""}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              label="Z"
              type="number"
              value={coordinates.z}
              onChange={(e) => handleCoordinateChange('z', e.target.value)}
              onBlur={() => handleCoordinateBlur('z')}
              size="small"
              fullWidth
              placeholder="Z (-50 to 50)"
            // Remove the inputProps that restrict input
            // inputProps={{ min: -50, max: 50 }}
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleCoordinateSubmit}
              fullWidth
              disabled={missionState !== 'idle'}
            >
              Set Position
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary">
              Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}
              {position && position[1] < MIN_SAFE_ALTITUDE && (
                <Chip
                  label="STEALTH MODE"
                  size="small"
                  color="success"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Mission Status */}
      <Box sx={{ mb: 3, p: 1, bgcolor: 'rgba(0,0,0,0.1)', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ mr: 1, color: missionStatus.color }}>{missionStatus.icon}</Box>
          <Typography variant="subtitle1" color={missionStatus.color} fontWeight="bold">
            {missionStatus.label}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          {missionStatus.description}
        </Typography>

        {/* Position information */}
        <Box sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          <div>Current: {position ? `[${position.map(n => Math.floor(n)).join(', ')}]` : 'Unknown'}</div>
          {missionState === 'moving' && attackPosition && (
            <div>Target: [{attackPosition.map(n => Math.floor(n)).join(', ')}]</div>
          )}
          {missionState === 'returning' && homeBase && (
            <div>Base: [{homeBase.map(n => Math.floor(n)).join(', ')}]</div>
          )}
        </Box>

        {/* Return to base button */}
        {(missionState === 'attacking' || missionState === 'moving') && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<HomeIcon />}
            onClick={returnToBase}
            sx={{ mt: 1 }}
          >
            Return To Base
          </Button>
        )}
      </Box>

      {/* Weapons System */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Weapons System
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button
            variant="contained"
            color={selectedWeapon === 'missile' ? 'primary' : 'inherit'}
            onClick={() => selectWeapon('missile')}
            disabled={missionState !== 'idle' && missionState !== 'attacking'}
            sx={{
              bgcolor: selectedWeapon === 'missile' ? '#90caf9' : 'transparent',
              '&:hover': { bgcolor: selectedWeapon === 'missile' ? '#64b5f6' : '#424242' }
            }}
          >
            MISSILES
            <Badge
              badgeContent={ammoCount.missile}
              color="error"
              sx={{ ml: 1 }}
            />
          </Button>
          <Button
            variant="contained"
            color={selectedWeapon === 'bomb' ? 'primary' : 'inherit'}
            onClick={() => selectWeapon('bomb')}
            disabled={missionState !== 'idle' && missionState !== 'attacking'}
            sx={{
              bgcolor: selectedWeapon === 'bomb' ? '#90caf9' : 'transparent',
              '&:hover': { bgcolor: selectedWeapon === 'bomb' ? '#64b5f6' : '#424242' }
            }}
          >
            BOMBS
            <Badge
              badgeContent={ammoCount.bomb}
              color="error"
              sx={{ ml: 1 }}
            />
          </Button>
        </Stack>
      </Box>

      {/* Target Acquisition */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Target Acquisition
        </Typography>

        {targeting.lockStatus !== 'inactive' && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2">Lock Status:</Typography>
            <LockOnProgress
              status={targeting.lockStatus}
              progress={targeting.lockTimer / targeting.maxLockTime}
            />
          </Box>
        )}

        {/* Fire Control - only enabled when at attack position with locked target */}
        <Button
          variant="contained"
          color="error"
          fullWidth
          disabled={
            missionState !== 'attacking' ||
            targeting.lockStatus !== 'locked' ||
            ammoCount[selectedWeapon] <= 0
          }
          onClick={() => {
            console.log("Fire button clicked");
            console.log("Mission state:", missionState);
            console.log("Lock status:", targeting.lockStatus);
            console.log("Selected weapon:", selectedWeapon);
            console.log("Ammo count:", ammoCount[selectedWeapon]);

            // Call fireMissile directly from the store to ensure we're using the latest state
            useAttackDroneStore.getState().fireMissile();
          }}
          startIcon={<MissileIcon />}
          sx={{ mb: 2 }}
        >
          FIRE {selectedWeapon.toUpperCase()}
        </Button>

        {/* Target list */}
        <Typography variant="subtitle2" gutterBottom>
          Available Targets:
        </Typography>

        {Array.isArray(targets) && targets.length > 0 ? (
          targets.map((target) => (
            <div
              key={target.id}
              style={{
                padding: '8px',
                marginBottom: '8px',
                backgroundColor: targeting.lockedTarget === target.id ? '#ffebee' : '#f5f5f5',
                border: targeting.lockedTarget === target.id ? '1px solid #f44336' : '1px solid #ccc',
                borderRadius: '4px',
                cursor: missionState === 'attacking' ? 'pointer' : 'default',
                opacity: missionState === 'attacking' ? 1 : 0.7
              }}
              onClick={() => missionState === 'attacking' && handleSelectTarget(target.id)}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
                  {target.type.charAt(0).toUpperCase() + target.type.slice(1)}
                </Typography>
                {/* <Chip
                  label={targeting.lockedTarget === target.id ? 'LOCKED' : 'SELECT'}
                  size="small"
                  color={targeting.lockedTarget === target.id ? 'error' : 'default'}
                  variant="outlined"
                  disabled={missionState !== 'attacking'}
                  icon={<GpsFixedIcon fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (missionState === 'attacking') {
                      handleSelectTarget(target.id);
                    }
                  }}
                /> */}

                <Chip
                  label={targeting.lockedTarget === target.id ? 'LOCKED' : 'SELECT'}
                  size="small"
                  color={targeting.lockedTarget === target.id ? 'error' : 'default'}
                  variant="outlined"
                  disabled={missionState !== 'attacking'}
                  icon={<GpsFixedIcon fontSize="small" />}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (missionState === 'attacking') {
                      handleSelectTarget(target.id);
                    }
                  }}
                  // ADD THIS SX PROP
                  sx={{
                    ...(targeting.lockedTarget !== target.id && {
                      borderColor: 'rgba(0, 0, 0, 0.87)',
                      color: 'black',
                      '.MuiChip-icon': {
                        color: 'black'
                      }
                    })
                  }}
                />
              </Box>
              <Typography variant="body2" color='black'>
                Distance: {calculateDistance(target.position)} m
              </Typography>
            </div>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No targets detected in range.
          </Typography>
        )}
      </Box>

      {/* Damage Assessment */}
      <DamageAssessment />

      {/* Defense System Warning */}
      {isDefenseSystemDetected && (
        <Box sx={{
          mb: 2,
          p: 1,
          bgcolor: 'rgba(255,0,0,0.15)',
          borderRadius: 1,
          border: '1px solid #f44336'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <WarningIcon color="error" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="error" fontWeight="bold">
              DEFENSE SYSTEM DETECTED
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Anti-aircraft defenses operational. Fly below {MIN_SAFE_ALTITUDE}m altitude to avoid detection.
          </Typography>
          {droneHealth < 100 && (
            <LinearProgress
              variant="determinate"
              value={droneHealth}
              sx={{
                mt: 1,
                height: 10,
                borderRadius: 1,
                backgroundColor: 'rgba(255,255,255,0.2)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: droneHealth > 70 ? '#4caf50' :
                    droneHealth > 30 ? '#ff9800' : '#f44336'
                }
              }}
            />
          )}

          {/* Anti-Drone Attack Button */}
          <Button
            variant="contained"
            color="error"
            fullWidth
            sx={{ mt: 1 }}
            onClick={handleAntiDroneAttack}
          >
            ACTIVATE DEFENSE SYSTEM
          </Button>
        </Box>
      )}

      {/* System Malfunction Warnings */}
      {communicationsJammed && (
        <Alert
          severity="error"
          icon={<BlockIcon />}
          sx={{ mb: 2 }}
        >
          COMMUNICATIONS JAMMED - Control systems impaired
        </Alert>
      )}

      {targetingJammed && (
        <Alert
          severity="error"
          icon={<BlockIcon />}
          sx={{ mb: 2 }}
        >
          TARGETING SYSTEMS JAMMED - Weapons systems offline
        </Alert>
      )}
    </Paper>
  );
};

export default AttackDashboard;