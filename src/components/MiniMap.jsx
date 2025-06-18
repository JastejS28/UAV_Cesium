// import React, { useRef } from 'react';
// import { Canvas, useFrame } from '@react-three/fiber';
// import { OrthographicCamera } from '@react-three/drei';
// import { useUAVStore } from '../store/uavStore'; // Ensure this path is correct: ../store/uavStore.js
// import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
// import CommandDashboard from './components/CommandDashboard';
// import LiveCameraView from './components/LiveCameraView';

// // UAVDot component to represent the UAV on the minimap
// function UAVDot() {
//   const { position } = useUAVStore();
//   const dotRef = useRef(null);

//   useFrame(() => {
//     if (dotRef.current) {
//       // Position the dot at the UAV's X and Z coordinates
//       // Y is set to be slightly above the plain map plane (e.g., 1 unit)
//       dotRef.current.position.set(position[0], 1, position[2]);
//     }
//   });

//   return (
//     <mesh ref={dotRef}>
//       <sphereGeometry args={[3, 16, 16]} /> {/* A moderately sized red dot */}
//       <meshBasicMaterial color="red" />
//     </mesh>
//   );
// }

// const MiniMap = () => (
//   <div style={{
//     position: 'absolute',
//     bottom: 24,
//     right: 24,
//     width: 200,
//     height: 200,
//     border: '2px solid #fff',
//     borderRadius: 8,
//     overflow: 'hidden',
//     background: '#222', // Dark background for the map
//     zIndex: 20
//   }}>
//     <Canvas orthographic>
//       {/* Orthographic Camera: For a top-down, flat view */}
//       <OrthographicCamera
//         makeDefault
//         position={[0, 100, 0]} // Camera 100 units above the origin (where the plane is)
//         up={[0, 1, 0]}         // Y-axis is up (standard for most 3D software)
//         near={1}                // Near clipping plane
//         far={200}               // Far clipping plane - adjust based on your desired map area
//         zoom={1}                // Adjust this to fit your desired map area (e.g., 0.5 for wider, 2 for closer)
//       />

//       {/* Basic Lighting for the minimap scene */}
//       <ambientLight intensity={0.5} />
//       <directionalLight position={[0, 50, 0]} intensity={1} /> {/* Light directly from above */}

//       {/* The "Plain Map" background - a large green plane */}
//       <mesh position={[0, 0, 0]}> {/* Position at the center of the minimap view */}
//         <planeGeometry args={[100, 100]} /> {/* A 100x100 unit plane */}
//         <meshBasicMaterial color="green" />
//       </mesh>

//       {/* The UAV dot */}
//       <UAVDot />
//     </Canvas>
//   </div>
// );

// const darkTheme = createTheme({
//   palette: {
//     mode: 'dark',
//   },
// });

// function App() {
//   return (
//     <ThemeProvider theme={darkTheme}>
//       <CssBaseline />
//       <Box sx={{ display: 'flex', height: '100vh' }}>
//         <Box sx={{ flexGrow: 1, position: 'relative' }}>
//           <Scene />
//         </Box>
//         <Box sx={{ position: 'absolute', right: 0, top: 0, zIndex: 1 }}>
//           <CommandDashboard />
//         </Box>
//         <LiveCameraView />
//       </Box>
//     </ThemeProvider>
//   );
// }

// export default App;
// export { MiniMap };