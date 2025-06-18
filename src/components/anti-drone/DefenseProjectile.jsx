import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DefenseProjectile = ({ startPosition, targetPosition, onComplete }) => {
  const projectileRef = useRef();
  const startTime = useRef(Date.now());
  const flightDuration = 1.0; // 1 second flight time
  const trailPoints = useRef([]);

  useFrame((state) => {
    if (!projectileRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / flightDuration, 1);

    // Calculate projectile position with ballistic arc
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...targetPosition);
    
    // Direct path vector
    const directPath = end.clone().sub(start);
    const distance = directPath.length();
    
    // Add ballistic arc
    const arcHeight = distance * 0.15;
    const arcProgress = Math.sin(progress * Math.PI);
    
    // Current position along path
    const pos = new THREE.Vector3().lerpVectors(
      start, 
      end,
      progress
    );
    
    // Add arc
    pos.y += arcHeight * arcProgress;
    
    // Update projectile position
    projectileRef.current.position.copy(pos);
    
    // Store trail points
    if (elapsed % 0.05 < 0.01) {
      trailPoints.current.push({
        position: pos.clone(),
        time: state.clock.elapsedTime
      });
    }
    
    // Rotate to face direction of travel
    if (progress < 1) {
      const nextPos = new THREE.Vector3().lerpVectors(start, end, Math.min(progress + 0.1, 1));
      nextPos.y += arcHeight * Math.sin(Math.min((progress + 0.1), 1) * Math.PI);
      projectileRef.current.lookAt(nextPos);
    }

    // Call onComplete when projectile reaches target
    if (progress === 1 && onComplete) {
      onComplete();
    }
  });

  return (
    <group>
      {/* Main projectile */}
      <mesh ref={projectileRef}>
        <cylinderGeometry args={[0.15, 0.3, 1, 8]} />
        <meshStandardMaterial color="#333333" />
        
        {/* Fins */}
        <mesh position={[0, -0.3, 0]} rotation={[0, Math.PI/4, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.6]} />
          <meshStandardMaterial color="#555555" />
        </mesh>
        <mesh position={[0, -0.3, 0]} rotation={[0, -Math.PI/4, 0]}>
          <boxGeometry args={[0.1, 0.4, 0.6]} />
          <meshStandardMaterial color="#555555" />
        </mesh>

        {/* Rocket exhaust */}
        <mesh position={[0, -0.6, 0]}>
          <coneGeometry args={[0.2, 0.8, 8]} />
          <meshBasicMaterial color="#ff6600" transparent opacity={0.7} />
        </mesh>
      </mesh>

      {/* Trails */}
      {trailPoints.current.map((point, i) => (
        <mesh key={i} position={point.position.toArray()}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial 
            color="#ff9900" 
            transparent={true} 
            opacity={Math.max(0, 1 - (state.clock.elapsedTime - point.time) * 2)} 
          />
        </mesh>
      ))}
    </group>
  );
};

export default DefenseProjectile;