import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const UAV = () => {
  const uavRef = useRef();
  const { position, rotation, setPosition, setRotation, targetPosition } = useUAVStore();
  
  // Try to load the UAV model, with fallback
  let scene = null;
  try {
    const gltf = useGLTF('/models/drone/uav.glb');
    scene = gltf.scene;
  } catch (error) {
    console.warn('Failed to load UAV model:', error);
  }

  // Simple movement
  useFrame(() => {
    if (!uavRef.current) return;
    
    // Convert Cesium coordinates to Three.js world coordinates for rendering
    // Scale factor to make the UAV visible in the Three.js scene
    const scale = 100000; // Scale factor for visibility
    const threeJSPosition = [
      (position[0] + 122.4194) * scale, // longitude to x
      position[1] * 0.1,                // altitude to y (scaled down)
      (position[2] - 37.7749) * scale   // latitude to z
    ];
    
    // Update UAV position and rotation directly from store
    if (targetPosition && Array.isArray(targetPosition)) {
      // Convert target to Three.js coordinates
      const threeJSTarget = [
        (targetPosition[0] + 122.4194) * scale,
        targetPosition[1] * 0.1,
        (targetPosition[2] - 37.7749) * scale
      ];
      
      // Calculate direction to target
      const dx = threeJSTarget[0] - threeJSPosition[0];
      const dz = threeJSTarget[2] - threeJSPosition[2];
      const dy = threeJSTarget[1] - threeJSPosition[1];
      
      // Distance to target
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      if (distance > 50) { // Threshold for Cesium scale
        // Move towards target
        const speed = 0.001; // Speed in Cesium coordinate units
        const newCesiumPos = [
          position[0] + (dx/distance) * speed / scale,
          position[1] + (dy/distance) * speed * 10,
          position[2] + (dz/distance) * speed / scale
        ];
        
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
  
  // Render UAV model or fallback
  if (scene) {
    return (
      <primitive 
        ref={uavRef}
        object={scene.clone()}
        scale={[3, 3, 3]}
        castShadow
      />
    );
  } else {
    // Fallback: simple box geometry
    return (
      <mesh ref={uavRef} castShadow>
        <boxGeometry args={[2, 0.5, 2]} />
        <meshStandardMaterial color="#ff6600" />
      </mesh>
    );
  }
};

// Preload with error handling
try {
  useGLTF.preload('/models/drone/uav.glb');
} catch (error) {
  console.warn('Failed to preload UAV model:', error);
}

export default UAV;