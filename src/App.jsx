import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import CommandDashboard from './components/CommandDashboard';
import AttackDashboard from './components/attack-drone/AttackDashboard';
import DroneTypeSelector from './components/drone-selector/DroneTypeSelector';
import LiveCameraView from './components/LiveCameraView';
import EnvironmentSettings from './components/EnvironmentSettings';
import { useUAVStore } from './store/uavStore';
import SoundInitializer from './components/SoundInitializer';
import Scene from './components/Scene';
import './App.css';

const darkTheme = createTheme({
  palette: {
    mode: 'dark', // MUI theme mode
  },
});

function App() {
  const [droneType, setDroneType] = useState('surveillance'); // Options: 'surveillance', 'attack', 'swarm'

  // Get direct access to store methods for the initial effect,
  // without causing re-renders of App for isThermalVision changes.
  const initialSetThermalVision = useUAVStore.getState().setThermalVision;
  const initialIsThermalVision = useUAVStore.getState().isThermalVision;

  useEffect(() => {
    // This effect runs only once on component mount.
    // Its purpose is to ensure thermal vision is OFF on initial load.
    console.log("[App.jsx] Initial mount check. Current isThermalVision:", initialIsThermalVision);
    if (initialIsThermalVision) {
      console.log("[App.jsx] Forcing thermal vision off on initial load.");
      initialSetThermalVision(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs only once on mount

  useEffect(() => {
    // Simple solution to enable audio after user interaction
    const enableAudio = () => {
      // Create and immediately play+pause a silent audio clip
      // This unblocks audio for future playback
      const unblockAudio = new Audio();
      unblockAudio.play().catch(() => {});
      unblockAudio.pause();
      
      // Remove the listeners after first interaction
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
    
    // Add listeners for first user interaction
    document.addEventListener('click', enableAudio);
    document.addEventListener('keydown', enableAudio);
    
    // Clean up
    return () => {
      document.removeEventListener('click', enableAudio);
      document.removeEventListener('keydown', enableAudio);
    };
  }, []);

  const { droneType: storeDroneType, setDroneType: setStoreDroneType } = useUAVStore();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      {/* Main application container using CSS Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 380px', // Main scene (flexible), Dashboard (fixed)
        gridTemplateRows: 'auto 1fr',    // Top controls row, Main content row
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#1e1e1e' // A slightly lighter dark background for the page
      }}>

        {/* Drone Type Selector */}
        <Box sx={{ position: 'absolute', top: 80, left: 20, zIndex: 15 }}>
          <DroneTypeSelector value={droneType} onChange={setDroneType} />
        </Box>
        
        {/* Command Dashboard based on drone type */}
        <div style={{
          gridColumn: '2 / 3', // Second column
          gridRow: '1 / 3',    // Span both rows
          backgroundColor: '#282c34',
          padding: '15px',
          overflowY: 'auto',
          zIndex: 5 // Ensure it's above the main canvas if there's any overlap concern
        }}>
          {droneType === 'surveillance' && <CommandDashboard />}
          {droneType === 'attack' && <AttackDashboard />}
          {/* Add SwarmDashboard conditionally if needed */}
        </div>

        {/* Main Scene Area (Middle/Left) */}
        <div style={{
          gridColumn: '1 / 2', // First column
          gridRow: '1 / 3',    // Span both rows (EnvironmentSettings will overlay this)
          position: 'relative', // For positioning LiveCameraView and EnvironmentSettings
          backgroundColor: '#000000' // Background for the canvas area itself
        }}>
         
          
          {/* EnvironmentSettings is rendered here so its absolute positioning is relative to this div */}
          <EnvironmentSettings /> 

          {/* LiveCameraView - Bottom Left Overlay */}
          <div style={{
            position: 'absolute',
            bottom: '20px',
            left: '20px',
            zIndex: 10 // Ensure it's above the main canvas
          }}>
            <LiveCameraView width={320} height={180} /> {/* Adjusted size slightly */}
          </div>

          {/* 3D Scene Component - Fills the remaining space */}
          <div style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            zIndex: 1 // Below the LiveCameraView and above the background
          }}>
            <Scene droneType={droneType} />
          </div>
        </div>

        {/* Sound Initializer - Ensures sound can play after user interaction */}
        <SoundInitializer />
      </div>
    </ThemeProvider>
  );
}

export default App;
