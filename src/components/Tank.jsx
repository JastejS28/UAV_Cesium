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

const SCAN_RADIUS = 20;

const Tank = ({ position = [40, 19, 16], id = 'tank-1' }) => {
  const { scene } = useGLTF('/models/tank/tank.glb');
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);
  
  // Apply thermal vision to tank
  useThermalMaterial(scene, 'tank');

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

    const tankWorldPosition = new THREE.Vector3(...position);
    const currentUAVPosition = new THREE.Vector3(...uavPosition);

    const distance = tankWorldPosition.distanceTo(currentUAVPosition);

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
        setTimeout(() => setShowEffect(false), 3000); // hide after 3 seconds
        console.log('Tank automatically marked:', newTarget);
      }
    }
  });

  // Log for debugging - important to see which ID is being used
  useEffect(() => {
    console.log(`Tank ID: ${id}, Generated ID: ${tankId.current}`);
    console.log(`Current destroyedTargets: ${JSON.stringify(destroyedTargets)}`);
  }, [id, destroyedTargets]);

  // Check if this tank is destroyed - check against both possible IDs
  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(tankId.current);
  
  // If tank is destroyed, render destroyed version instead
  if (isDestroyed) {
    console.log(`Tank at position ${position} is marked as destroyed`);
    return (
      <>
        <DestroyedTarget position={position} targetType="tank" />
        {/* Lower position for fire to be on the ground */}
        <FireEffect position={[position[0], position[1] + 0.2, position[2]]} intensity={1.2} />
      </>
    );
  }

  return (
    <>
      <primitive object={scene.clone()} position={position} scale={[0.5, 0.5, 0.5]} />
      {showEffect && <DetectionEffect position={position} />}
    </>
  );
};

useGLTF.preload('/models/tank/tank.glb');
export default Tank;