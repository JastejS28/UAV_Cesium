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

const Warehouse = ({ position = [-20, 20, -20], id = 'warehouse-1' }) => {
  const { scene } = useGLTF('/models/building/warehouse.glb');
  // For destroyed warehouse, load it directly
  const { scene: destroyedScene } = useGLTF('/models/building/destroyed-warehouse.glb', true);
  
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);
  const destroyedWarehouse = useRef(destroyedScene);

  // Apply thermal vision to warehouse
  useThermalMaterial(scene);
  
  // Compute unique ID for this warehouse
  const warehouseId = useRef(`warehouse-${position[0]}-${position[1]}-${position[2]}`);

  // Check if already marked
  useEffect(() => {
    if (targets && targets.some(target => target.id === warehouseId.current)) {
      alreadyDetected.current = true;
    }
  }, [targets]);

  useFrame(() => {
    if (alreadyDetected.current) return;

    const warehouseWorldPosition = new THREE.Vector3(...position);
    const currentUAVPosition = new THREE.Vector3(...uavPosition);

    const distance = warehouseWorldPosition.distanceTo(currentUAVPosition);

    if (distance < SCAN_RADIUS) {
      const isAlreadyMarked = targets.some(target => target.id === warehouseId.current);

      if (!isAlreadyMarked) {
        const newTarget = {
          id: warehouseId.current,
          position: position,
          type: 'warehouse',
        };
        addTarget(newTarget);
        alreadyDetected.current = true;
        setShowEffect(true);
        setTimeout(() => setShowEffect(false), 3000);
        console.log('Warehouse automatically marked:', newTarget);
      }
    }
  });

  // Check if this warehouse is destroyed
  const isDestroyed = destroyedTargets.includes(id) || destroyedTargets.includes(warehouseId.current);
  
  // If warehouse is destroyed, render destroyed version
  if (isDestroyed) {
    if (destroyedWarehouse.current) {
      return (
        <>
          <primitive 
            object={destroyedWarehouse.current} 
            position={position} 
            scale={[2, 2, 2]} 
          />
          
          {/* Multiple fires at different positions */}
          <FireEffect position={[position[0], position[1] + 0.8, position[2]]} intensity={1.5} />
          <FireEffect position={[position[0] - 1.5, position[1] + 0.4, position[2] - 1]} intensity={0.8} />
          <FireEffect position={[position[0] + 1.2, position[1] + 0.6, position[2] + 1.2]} intensity={1.0} />
        </>
      );
    } else {
      // Fallback if model isn't available
      return (
        <>
          <DestroyedTarget position={position} targetType="warehouse" />
          {/* Multiple fires at different positions */}
          <FireEffect position={[position[0], position[1] + 0.8, position[2]]} intensity={1.5} />
          <FireEffect position={[position[0] - 1.5, position[1] + 0.4, position[2] - 1]} intensity={0.8} />
          <FireEffect position={[position[0] + 1.2, position[1] + 0.6, position[2] + 1.2]} intensity={1.0} />
        </>
      );
    }
  }

  return (
    <>
      <primitive object={scene} position={position} scale={[0.2, 0.2, 0.2]} />
      {showEffect && <DetectionEffect position={position} />}
    </>
  );
};

// Preload models to avoid glitches
useGLTF.preload('/models/building/warehouse.glb');
// Proper preloading without try/catch
useGLTF.preload('/models/building/destroyed-warehouse.glb', true);

export default Warehouse;