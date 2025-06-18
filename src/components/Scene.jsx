import React, { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import DayEnvironment from './DayEnvironment';
import NightEnvironment from './NightEnvironment';
import RainEnvironment from './RainEnvironment';
import Terrain from './Terrain';
import UAV from './UAV';
import AttackUAV from './attack-drone/AttackUAV';
// SwarmUAVs import was missing in your provided Scene.jsx, adding it back if needed
// import SwarmUAVs from './SwarmUAVs'; 
import ThermalVisionEffect from './ThermalVisionEffect';
import Tank from './Tank';
import Jeep from './Jeep';
import Warehouse from './Warehouse';
import { useUAVStore } from '../store/uavStore';
// Ensure Scene.jsx uses useEnvironmentStore for environmentMode
import { useEnvironmentStore } from '../store/environmentStore';
// Add import for AntiDroneSystem
import AntiDroneSystem from './anti-drone/AntiDroneSystem';
// Import the new component
import ArmyBase from './ArmyBase';
import { useAttackDroneStore } from '../store/attackDroneStore'; // Import the attack drone store


const Scene = ({ droneType }) => {
  // Correctly use useEnvironmentStore for environmentMode
  const { environmentMode } = useEnvironmentStore(); 

  useEffect(() => {
    if (droneType === 'attack') {
      const homeBase = [-50, 30, -40];
      // Assuming position is part of uavStore for the drone itself
      useUAVStore.setState({ position: [...homeBase] }); 
    }
  }, [droneType]);
  
  
  return (
    <Canvas 
      shadows 
      gl={{ antialias: true }}
      style={{ 
        background: environmentMode === 'night' ? '#000000' : (environmentMode === 'rain' ? '#33333D' : '#87CEEB'),
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      }}
    >
      <PerspectiveCamera 
        makeDefault 
        position={[0, 100, 80]} 
        fov={60} 
        near={0.1} 
        far={10000} 
      />
      <OrbitControls 
        target={[0, 25, 0]} 
        maxPolarAngle={Math.PI / 2} // Limit rotation to horizon level (90 degrees)
        minDistance={5} 
        maxDistance={500}
        enableZoom={true}
        enablePan={true}
        screenSpacePanning={false} // Prevent going below ground when panning
        minPolarAngle={0} // Can't look up beyond the zenith
      />
      
      {/* Environment specific lighting and sky */}
      {environmentMode === 'day' && <DayEnvironment />}
      {environmentMode === 'night' && <NightEnvironment />}
      {environmentMode === 'rain' && <RainEnvironment />}
      
      {/* 
        REMOVE or significantly REDUCE these global lights.
        Let DayEnvironment, NightEnvironment, and RainEnvironment provide their own complete lighting.
      */}
      {/* <ambientLight intensity={0.5} /> */}
      {/* <directionalLight position={[50, 100, 50]} intensity={0.8} castShadow /> */}
      
      <Terrain />
      
      {/* <Tank position={[-10, 19, -15]} id="tank--10-19--15" /> */}
      {/* <Jeep position={[-15, 19, -25]} id="jeep--15-19--25" />
      <Warehouse position={[0, 20, -30]} id="warehouse-0-20--30" /> */}
      {/* <Tank position={[20, 19, 10]} id="tank-20-19-10" /> */}
      {/* <Jeep position={[30, 19, 5]} id="jeep-30-19-5" />
      <Warehouse position={[10, 20, 25]} id="warehouse-10-20-25" /> */}
      <Tank position={[40, 19, 16]} id="tank-40-19-16" />
      <Jeep position={[40, 19, 20]} id="jeep-40-19-20" />
      <Warehouse position={[40, 20, 35]} id="warehouse-40-20-35" />
      
      {/* Anti-drone defense systems at key locations */}
      <AntiDroneSystem 
        position={[40, 20, 35]} 
        baseId="warehouse-defense"
      />
      
      {/* New ArmyBase component addition */}
      <ArmyBase position={[-45, 25, -40]} id="army-base-1" />
      
      {droneType === 'surveillance' && <UAV />}
      {droneType === 'attack' && <AttackUAV />}
      {/* {droneType === 'swarm' && <SwarmUAVs />} */} {/* Uncomment if SwarmUAVs is used */}
      
      <ThermalVisionEffect />
    </Canvas>
  );
};

export default Scene;