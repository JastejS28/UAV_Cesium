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

const Warehouse = ({ position = [-122.4294, 100, 37.7649], id = 'warehouse-1' }) => {
  const { addTarget, position: uavPosition, targets } = useUAVStore();
  const { destroyedTargets } = useAttackDroneStore();
  const alreadyDetected = useRef(false);
  const [showEffect, setShowEffect] = useState(false);
  const [scene, setScene] = useState(null);
  const [destroyedScene, setDestroyedScene] = useState(null);

  // Load models with error handling
  useEffect(() => {
    try {
      const gltf = useGLTF('/models/building/warehouse.glb');
      setScene(gltf.scene);
      useThermalMaterial(gltf.scene, 'warehouse');
    } catch (error) {
      console.warn('Failed to load warehouse model:', error);
    }

    try {
      const destroyedGltf = useGLTF('/models/building/destroyed-warehouse.glb', true);
      setDestroyedScene(destroyedGltf.scene);
    } catch (error) {
      console.warn('Failed to load destroyed warehouse model:', error);
    }
  }, []);
  
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

    const warehousePos = new THREE.Vector3(...position);
    const uavPos = new THREE.Vector3(...uavPosition);

    const distance = warehousePos.distanceTo(uavPos);

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
  
  // Convert Cesium coordinates to Three.js coordinates for rendering
  const scale = 100000;
  const threeJSPosition = [
    (position[0] + 122.4194) * scale,
    position[1] * 0.1,
    (position[2] - 37.7749) * scale
  ];
  
  // If warehouse is destroyed, render destroyed version
  if (isDestroyed) {
    if (destroyedScene) {
      return (
        <>
          <primitive 
            object={destroyedScene.clone()} 
            position={threeJSPosition} 
            scale={[2, 2, 2]} 
          />
          
          {/* Multiple fires at different positions */}
          <FireEffect position={[threeJSPosition[0], threeJSPosition[1] + 0.8, threeJSPosition[2]]} intensity={1.5} />
          <FireEffect position={[threeJSPosition[0] - 1.5, threeJSPosition[1] + 0.4, threeJSPosition[2] - 1]} intensity={0.8} />
          <FireEffect position={[threeJSPosition[0] + 1.2, threeJSPosition[1] + 0.6, threeJSPosition[2] + 1.2]} intensity={1.0} />
        </>
      );
    } else {
      // Fallback if model isn't available
      return (
        <>
          <DestroyedTarget position={threeJSPosition} targetType="warehouse" />
          <FireEffect position={[threeJSPosition[0], threeJSPosition[1] + 0.8, threeJSPosition[2]]} intensity={1.5} />
        </>
      );
    }
  }

  return (
    <>
      {scene ? (
        <primitive object={scene.clone()} position={threeJSPosition} scale={[0.2, 0.2, 0.2]} />
      ) : (
        // Fallback: simple box geometry
        <mesh position={threeJSPosition}>
          <boxGeometry args={[8, 4, 10]} />
          <meshStandardMaterial color="#8a8a8a" />
        </mesh>
      )}
      {showEffect && <DetectionEffect position={threeJSPosition} />}
    </>
  );
};

// Preload models with error handling
try {
  useGLTF.preload('/models/building/warehouse.glb');
} catch (error) {
  console.warn('Failed to preload warehouse model:', error);
}

try {
  useGLTF.preload('/models/building/destroyed-warehouse.glb', true);
} catch (error) {
  console.warn('Failed to preload destroyed warehouse model:', error);
}

export default Warehouse;