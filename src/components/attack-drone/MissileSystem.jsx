import React, { useState, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAttackDroneStore } from '../../store/attackDroneStore';
import ModelExplosion from './WeaponryEffects/ModelExplosion';
import ScorchMark from './ScorchMark';

const MissileSystem = () => {
  const { activeMissiles } = useAttackDroneStore();
  
  // State to track explosions and scorch marks
  const [explosions, setExplosions] = useState([]);
  const [scorchMarks, setScorchMarks] = useState([]);
  
  // Limit maximum number of scorch marks to prevent performance issues
  const MAX_SCORCH_MARKS = 10;
  
  // Check if a missile has reached its target and handle impact
  const checkMissileImpact = useCallback(() => {
    const impactedMissiles = activeMissiles.filter(missile => 
      missile.flightProgress >= 1.0 && missile.flightProgress < 1.0 + missile.speed * 0.1
    );
    
    if (impactedMissiles.length > 0) {
      console.log("Missiles impacted targets:", impactedMissiles.length);
      
      // Create new explosions
      const newExplosions = impactedMissiles.map(missile => ({
        id: `explosion-${missile.id}-${Date.now()}`,
        position: [...missile.targetPosition],
        timestamp: Date.now()
      }));
      
      // Create new scorch marks
      const newScorchMarks = impactedMissiles.map(missile => ({
        id: `scorch-${missile.id}-${Date.now()}`,
        position: [...missile.targetPosition],
        size: missile.weaponType === 'missile' ? 5 : 8,
        timestamp: Date.now()
      }));
      
      if (newExplosions.length > 0) {
        setExplosions(prev => [...prev, ...newExplosions]);
      }
      
      if (newScorchMarks.length > 0) {
        setScorchMarks(prev => {
          const combined = [...prev, ...newScorchMarks];
          return combined.slice(-MAX_SCORCH_MARKS);
        });
      }
    }
    
    // Clean up old explosions (after 5 seconds)
    const now = Date.now();
    setExplosions(prev => prev.filter(exp => now - exp.timestamp < 5000));
  }, [activeMissiles]);
  
  // Check for impacts on each frame
  useFrame(() => {
    checkMissileImpact();
  });

  return (
    <group>
      {/* Active missiles in flight */}
      {activeMissiles.filter(missile => missile.flightProgress < 1.0).map(missile => {
        const start = new THREE.Vector3(...missile.position);
        const end = new THREE.Vector3(...missile.targetPosition);
        const current = new THREE.Vector3().lerpVectors(
          start, end, missile.flightProgress
        );
        
        const direction = new THREE.Vector3().subVectors(end, start).normalize();
        const rotation = new THREE.Euler();
        const upVector = new THREE.Vector3(0, 1, 0);
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
          upVector, direction
        );
        rotation.setFromQuaternion(quaternion);
        rotation.x += Math.PI / 2;
        
        return (
          <mesh 
            key={`missile-${missile.id}`}
            position={[current.x, current.y, current.z]}
            rotation={[rotation.x, rotation.y, rotation.z]}
          >
            <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
            <meshStandardMaterial color="#555555" />
            
            <mesh position={[0, 0.6, 0]}>
              <coneGeometry args={[0.1, 0.5, 8]} />
              <meshBasicMaterial color="#ff3300" emissive="#ff3300" emissiveIntensity={1} />
            </mesh>
          </mesh>
        );
      })}
      
      {/* Render explosions */}
      {explosions.map(explosion => (
        <ModelExplosion
          key={explosion.id}
          id={explosion.id}
          position={explosion.position}
        />
      ))}
      
      {/* Render scorch marks */}
      {scorchMarks.map(mark => (
        <ScorchMark
          key={mark.id}
          position={mark.position}
          size={mark.size}
        />
      ))}
    </group>
  );
};

export default MissileSystem;