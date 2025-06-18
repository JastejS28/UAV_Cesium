import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';

const UAV = () => {
  const { scene } = useGLTF('/models/drone/uav.glb');
  const uavRef = useRef();
  const { position, rotation, setPosition, setRotation, targetPosition } = useUAVStore();
  
  // Simple movement
  useFrame(() => {
    if (!uavRef.current) return;
    
    // Update UAV position and rotation directly from store
    if (targetPosition && Array.isArray(targetPosition)) {
      // Calculate direction to target
      const dx = targetPosition[0] - position[0];
      const dz = targetPosition[2] - position[2];
      const dy = targetPosition[1] - position[1];
      
      // Distance to target
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (distance > 0.5) {
        // Move towards target
        const speed = 0.5;
        const newPos = [
          position[0] + (dx/distance) * speed,
          position[1] + (dy/distance) * speed,
          position[2] + (dz/distance) * speed
        ];
        
        setPosition(newPos);
        
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
    
    // Apply position and rotation to model
    uavRef.current.position.set(...position);
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