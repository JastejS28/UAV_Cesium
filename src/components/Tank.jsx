import React, { useRef, useState, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';
import { useAttackDroneStore } from '../store/attackDroneStore';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import DetectionEffect from './DetectionEffect';
import useThermalMaterial from './useThermalMaterial';
import DestroyedTarget from './attack-drone/DestroyedTarget';
import FireEffect from './attack-drone/FireEffect';

const SCAN_RADIUS = 0.01; // Adjusted for Cesium coordinates

const Tank = ({ position = [-122.4144, 100, 37.7799], id = 'tank-1' }) => {
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);
  const [scene, setScene] = useState(null);
  
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();

  // Load model with error handling
  useEffect(() => {
    try {
      const gltf = useGLTF('/models/tank/tank.glb');
      setScene(gltf.scene);
      useThermalMaterial(gltf.scene, 'tank');
    } catch (error) {
      console.warn('Failed to load tank model:', error);
    }
  }, []);

  // Compute unique ID for this tank
  const tankId = useRef(`tank-${position[0]}-${position[1]}-${position[2]}`);

  // Check if this tank is already marked as a target
  useEffect(() => {
    if (targets && targets.some(target => target.id === tankId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  useFrame(() => {
    if (alreadyDetected.current) return;

    // Convert positions to comparable coordinates
    const tankPos = new THREE.Vector3(...position);
    const uavPos = new THREE.Vector3(...uavPosition);

    const distance = tankPos.distanceTo(uavPos);

    if (distance < SCAN_RADIUS) {
      const isAlreadyMarked = targets.some(target => target.id === tankId.current);

      if (!isAlreadyMarked) {
        const newTarget = {
          id: tankId.current,
          position: position,
          type: 'tank',
        };
        addTarget(newTarget);
        alreadyDetected.current = true;
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
        console.log('Tank automatically marked:', newTarget);
      }
    }
  });

  // Check if this tank is destroyed
  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(tankId.current);
  
  // Convert Cesium coordinates to Three.js coordinates for rendering
  const scale = 100000;
  const threeJSPosition = [
    (position[0] + 122.4194) * scale,
    position[1] * 0.1,
    (position[2] - 37.7749) * scale
  ];
  
  // If tank is destroyed, render destroyed version instead
  if (isDestroyed) {
    console.log(`Tank at position ${position} is marked as destroyed`);
    return (
      <>
        <DestroyedTarget position={threeJSPosition} targetType="tank" />
        <FireEffect position={[threeJSPosition[0], threeJSPosition[1] + 0.2, threeJSPosition[2]]} intensity={1.2} />
      </>
    );
  }

  return (
    <>
      {scene ? (
        <primitive object={scene.clone()} position={threeJSPosition} scale={[0.5, 0.5, 0.5]} />
      ) : (
        // Fallback: simple box geometry
        <mesh position={threeJSPosition}>
          <boxGeometry args={[4, 2, 6]} />
          <meshStandardMaterial color="#4a4a4a" />
        </mesh>
      )}
      {showEffect && <DetectionEffect position={threeJSPosition} />}
    </>
  );
};

// Preload with error handling
try {
  useGLTF.preload('/models/tank/tank.glb');
} catch (error) {
  console.warn('Failed to preload tank model:', error);
}

export default Tank;