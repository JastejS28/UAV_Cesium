import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
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
      }}
      onCreated={({ gl }) => {
        gl.autoClear = false;
      }}
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 2, pointerEvents: 'none' }}
    >
      <React.Fragment>
        <color attach="background" args={['rgba(0, 0, 0, 0)']} />
        <fog attach="fog" args={['#17171b', 300, 1000]} />

        {/* Render Environment based on mode */}
        {environmentMode === 'day' && <DayEnvironment />}
        {environmentMode === 'night' && <NightEnvironment />}
        {environmentMode === 'rain' && <RainEnvironment />}

        {/* Always render CesiumTerrain component */}
        <CesiumTerrain />

        {/* Render drone based on type */}
        {droneType === 'surveillance' && <UAV />}
        {droneType === 'attack' && <AttackUAV />}

        {/* Other scene components */}
        <Tank />
        <Jeep />
        <Warehouse />
        <ArmyBase />
        <AntiDroneSystem />

        {/* Effects */}
        <ThermalVisionEffect />
      </React.Fragment>
    </Canvas>
  );
};

export default Scene;