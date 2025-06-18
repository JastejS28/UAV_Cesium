// components/anti-drone/ProjectileEffect.jsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ProjectileEffect = ({ startPosition, targetPosition, startTime, gunRef }) => {
  const projectileRef = useRef();
  const trailRef = useRef([]);
  const flightDuration = 1.5; // 1.5 seconds to reach target
  
  useFrame((state) => {
    if (!projectileRef.current || !gunRef.current) return;
    
    const elapsed = state.clock.elapsedTime - startTime;
    const progress = Math.min(elapsed / flightDuration, 1);
    
    // Get gun's world position and orientation
    const gunWorldPos = new THREE.Vector3();
    gunRef.current.getWorldPosition(gunWorldPos);
    
    // Convert target from world to local space
    const worldTarget = new THREE.Vector3(...targetPosition);
    
    // Bullet position calculation
    if (progress < 1) {
      // Ballistic arc trajectory
      const startPos = new THREE.Vector3(...startPosition).add(gunWorldPos);
      
      // Calculate direct path
      const directPath = new THREE.Vector3().subVectors(worldTarget, startPos);
      
      // Add arc by manipulating Y component
      const arcHeight = directPath.length() * 0.2;
      const arcProgress = Math.sin(progress * Math.PI);
      
      // Interpolate position with arc
      const currentPos = new THREE.Vector3().lerpVectors(
        startPos, 
        worldTarget,
        progress
      );
      
      // Add arc height
      currentPos.y += arcHeight * arcProgress;
      
      // Set projectile position
      projectileRef.current.position.copy(currentPos);
      
      // Store trail points
      if (elapsed % 0.1 < 0.02) {
        trailRef.current.push({
          position: currentPos.clone(),
          time: state.clock.elapsedTime
        });
      }
      
      // Direction for projectile orientation
      const lookAhead = new THREE.Vector3().lerpVectors(
        currentPos,
        worldTarget,
        0.1
      );
      projectileRef.current.lookAt(lookAhead);
    }
  });
  
  return (
    <group>
      {/* Projectile */}
      <mesh ref={projectileRef}>
        <capsuleGeometry args={[0.1, 0.5, 8, 8]} />
        <meshStandardMaterial color="#ffcc00" emissive="#ff6600" />
      </mesh>
      
      {/* Trails */}
      {trailRef.current.map((point, i) => (
        <mesh key={i} position={point.position.toArray()}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color="#ff9900" 
            transparent={true} 
            opacity={Math.max(0, 1 - (state.clock.elapsedTime - point.time))} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default ProjectileEffect;