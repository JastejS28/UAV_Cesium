import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const UAV = () => {
  const { scene } = useGLTF('/models/drone/uav.glb');
  const uavRef = useRef();
  const { position, rotation, setPosition, setRotation, targetPosition, toThreeJSCoords, toCesiumCoords } = useUAVStore();
  
  // Simple movement
  useFrame(() => {
    if (!uavRef.current) return;
    
    // Convert Cesium coordinates to Three.js coordinates for rendering
    const threeJSPosition = toThreeJSCoords(position);
    
    // Update UAV position and rotation directly from store
    if (targetPosition && Array.isArray(targetPosition)) {
      // Convert target to Three.js coordinates
      const threeJSTarget = toThreeJSCoords(targetPosition);
      
      // Calculate direction to target
      const dx = threeJSTarget[0] - threeJSPosition[0];
      const dz = threeJSTarget[2] - threeJSPosition[2];
      const dy = threeJSTarget[1] - threeJSPosition[1];
      
      // Distance to target
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (distance > 5) { // Increased threshold for Cesium scale
        // Move towards target
        const speed = 2; // Increased speed for Cesium scale
        const newThreeJSPos = [
          threeJSPosition[0] + (dx/distance) * speed,
          threeJSPosition[1] + (dy/distance) * speed,
          threeJSPosition[2] + (dz/distance) * speed
        ];
        
        // Convert back to Cesium coordinates and update store
        const newCesiumPos = toCesiumCoords(newThreeJSPos);
        setPosition(newCesiumPos);
        
        // Update rotation
        if (dx !== 0 || dz !== 0) {
          const angle = Math.atan2(dx, dz);
          setRotation([0, angle, 0]);
        }
      } else {
        // Reached target - clear target
        useUAVStore.setState({ targetPosition: null });
      }
    }
    
    // Apply position and rotation to model (using Three.js coordinates)
    uavRef.current.position.set(...threeJSPosition);
    uavRef.current.rotation.set(rotation[0], rotation[1] + Math.PI, rotation[2]); // Keep 180° rotation
  });
  
  return (
    <primitive 
      ref={uavRef}
      object={scene.clone()}
      scale={[3, 3, 3]}
      castShadow
    />
  );
};

export default UAV;