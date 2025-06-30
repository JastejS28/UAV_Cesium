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

const Jeep = ({ position = [-122.4094, 100, 37.7699], id = 'jeep-1' }) => {
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);
  const [scene, setScene] = useState(null);
  
  // Load model with error handling
  useEffect(() => {
    try {
      const gltf = useGLTF('/models/jeep/jeep.glb');
      setScene(gltf.scene);
      useThermalMaterial(gltf.scene, 'jeep');
    } catch (error) {
      console.warn('Failed to load jeep model:', error);
    }
  }, []);

  // Compute unique ID for this jeep
  const jeepId = useRef(`jeep-${position[0]}-${position[1]}-${position[2]}`);

  // Check if this jeep is already marked as a target
  useEffect(() => {
    if (targets && targets.some(target => target.id === jeepId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  useFrame(() => {
    if (alreadyDetected.current) return;

    const jeepPos = new THREE.Vector3(...position);
    const uavPos = new THREE.Vector3(...uavPosition);

    const distance = jeepPos.distanceTo(uavPos);

    if (distance < SCAN_RADIUS) {
      const isAlreadyMarked = targets.some(target => target.id === jeepId.current);

      if (!isAlreadyMarked) {
        const newTarget = {
          id: jeepId.current,
          position: position,
          type: 'jeep',
        };
        addTarget(newTarget);
        alreadyDetected.current = true;
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
        console.log('Jeep automatically marked:', newTarget);
      }
    }
  });

  // Check if this jeep is destroyed
  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(jeepId.current);
  
  // Convert Cesium coordinates to Three.js coordinates for rendering
  const scale = 100000;
  const threeJSPosition = [
    (position[0] + 122.4194) * scale,
    position[1] * 0.1,
    (position[2] - 37.7749) * scale
  ];
  
  // If jeep is destroyed, render destroyed version instead
  if (isDestroyed) {
    return (
      <>
        <DestroyedTarget position={threeJSPosition} targetType="jeep" />
        <FireEffect position={[threeJSPosition[0], threeJSPosition[1] + 0.3, threeJSPosition[2]]} intensity={0.8} />
      </>
    );
  }

  return (
    <>
      {scene ? (
        <primitive object={scene.clone()} position={threeJSPosition} scale={[0.03, 0.03, 0.03]} />
      ) : (
        // Fallback: simple box geometry
        <mesh position={threeJSPosition}>
          <boxGeometry args={[3, 1.5, 5]} />
          <meshStandardMaterial color="#6a6a6a" />
        </mesh>
      )}
      {showEffect && <DetectionEffect position={threeJSPosition} />}
    </>
  );
};

// Preload with error handling
try {
  useGLTF.preload('/models/jeep/jeep.glb');
} catch (error) {
  console.warn('Failed to preload jeep model:', error);
}

export default Jeep;