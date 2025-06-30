import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import DayEnvironment from './DayEnvironment';
import NightEnvironment from './NightEnvironment';
import RainEnvironment from './RainEnvironment';
import CesiumTerrain from './CesiumTerrain';
import UAV from './UAV';
import AttackUAV from './attack-drone/AttackUAV';
import ThermalVisionEffect from './ThermalVisionEffect';
import Tank from './Tank';
import Jeep from './Jeep';
import Warehouse from './Warehouse';
import { useEnvironmentStore } from '../store/environmentStore';
import AntiDroneSystem from './anti-drone/AntiDroneSystem';
import ArmyBase from './ArmyBase';

const Scene = ({ droneType }) => {
  const { environmentMode } = useEnvironmentStore();

  return (
    <Canvas
      shadows
      gl={{
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: true,
      }}
      onCreated={({ gl, scene }) => {
        // Make the Three.js canvas transparent so Cesium shows through
        gl.setClearColor(0x000000, 0);
        gl.autoClear = false;
        
        // Ensure proper rendering order
        scene.renderOrder = 1;
      }}
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 2, 
        pointerEvents: 'none',
        background: 'transparent'
      }}
    >
      <React.Fragment>
        {/* Transparent background to show Cesium underneath */}
        <color attach="background" args={[0, 0, 0, 0]} />
        
        {/* Minimal fog for Three.js objects only */}
        <fog attach="fog" args={['#17171b', 1000, 5000]} />

        {/* Camera synchronization with Cesium */}
        <CesiumTerrain />

        {/* Environment effects (these will be overlaid on Cesium) */}
        {environmentMode === 'day' && <DayEnvironment />}
        {environmentMode === 'night' && <NightEnvironment />}
        {environmentMode === 'rain' && <RainEnvironment />}

        {/* Render drone based on type */}
        {droneType === 'surveillance' && <UAV />}
        {droneType === 'attack' && <AttackUAV />}

        {/* Scene objects - these will appear as overlays on the Cesium terrain */}
        <Tank />
        <Jeep />
        <Warehouse />
        <ArmyBase />
        <AntiDroneSystem />

        {/* Effects */}
        <ThermalVisionEffect />

        {/* Lighting for Three.js objects */}
        <ambientLight intensity={0.6} />
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1} 
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
      </React.Fragment>
    </Canvas>
  );
};

export default Scene;