import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../../store/uavStore';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import MissileSystem from './MissileSystem';
import TargetLockSystem from './TargetLockSystem';
import MissileLaunch from './WeaponryEffects/MissileLaunch';
import UavDamageSystem from '../anti-drone/UavDamageSystem';
import CrashedUAV from './CrashedUAV'; // Import the new component

const AttackUAV = () => {
  // Use surveillance drone model but with smaller scale until you have attack drone model
  const { scene } = useGLTF('/models/surveillance-uav/drone.glb');
  
  const uavRef = useRef();
  const { position, rotation } = useUAVStore();
  const { 
    activeMissiles, 
    updateMissiles, 
    initTargets, 
    updateMissionMovement,
    missionState,
    droneHealth,
    updateCrashAnimation // Add this new import
  } = useAttackDroneStore();
  
  // Initialize the targets and position on mount
  useEffect(() => {
    console.log("AttackUAV mounted - initializing targets and position");
    initTargets();
  }, [initTargets]);
  
  useFrame((state, delta) => {
    // If in crashed state, update crash animation but don't position the main UAV model
    if (missionState === 'crashed') {
      // Update falling animation
      updateCrashAnimation(delta);
      return;
    }
    
    if (!uavRef.current) return;
    
    // Update UAV position based on store
    if (position && position.length === 3) {
      uavRef.current.position.set(...position);
    }
    
    // Update UAV rotation based on store
    if (rotation && rotation.length === 3) {
      uavRef.current.rotation.set(...rotation);
    }
    
    // Update attack mission movement
    updateMissionMovement(delta);
    
    // Update missiles in flight
    updateMissiles(delta);
  });
  
  // If the drone is crashed, show the crashed version
  if (missionState === 'crashed') {
    return <CrashedUAV position={position} />;
  }
  
  return (
    <>
      {scene ? (
        <primitive 
          ref={uavRef}
          object={scene.clone()}
          scale={[0.08, 0.08, 0.08]}
          castShadow
        />
      ) : (
        // Fallback mesh if no model is available
        <mesh ref={uavRef}>
          <boxGeometry args={[1, 0.2, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
      
      {/* Add damage effects */}
      <UavDamageSystem position={position} />
      
      {/* Engine thrust/exhaust effect based on mission state */}
      {(missionState === 'moving' || missionState === 'returning') && (
        <mesh position={[0, -0.5, -1.5]} scale={[0.5, 0.5, 2]}>
          <coneGeometry args={[1, 2, 16]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
        </mesh>
      )}
      
      {/* Missile system for visualizing missiles in flight */}
      <MissileSystem />
      
      {/* Target lock visualization */}
      <TargetLockSystem />
      
      {/* Launch effects for active missiles */}
      {activeMissiles.filter(m => m.flightProgress < 0.1).map(missile => (
        <MissileLaunch 
          key={missile.id} 
          position={missile.position} 
        />
      ))}
    </>
  );
};

useGLTF.preload('/models/surveillance-uav/drone.glb');

export default AttackUAV;