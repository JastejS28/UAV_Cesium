import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Simpler bomb component without FireEffect dependency
const DefenseBomb = ({ startPosition, targetPosition, onComplete }) => {
  const bombRef = useRef();
  const startTime = useRef(Date.now());
  const flightDuration = 2.0; // 2 seconds flight time
  const [hasExploded, setHasExploded] = useState(false);
  const [explosionPosition, setExplosionPosition] = useState(null);
  const [explosionTime, setExplosionTime] = useState(0);
  const trailPoints = useRef([]);
  
  // Add smoke trail generation
  useEffect(() => {
    console.log("Bomb initialized:", { start: startPosition, target: targetPosition });
    const interval = setInterval(() => {
      if (bombRef.current && !hasExploded) {
        trailPoints.current.push({
          position: bombRef.current.position.clone(),
          time: Date.now() / 1000,
          size: 0.2 + Math.random() * 0.2
        });
        
        // Limit trail length
        if (trailPoints.current.length > 20) {
          trailPoints.current.shift();
        }
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, []);

  useFrame((state) => {
    if (hasExploded) {
      // Handle explosion effects
      const explodeDuration = 1.5;
      const timeElapsed = state.clock.elapsedTime - explosionTime;
      
      // Remove explosion after duration
      if (timeElapsed > explodeDuration) {
        console.log("Explosion complete");
        onComplete?.();
      }
      return;
    }
    
    if (!bombRef.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    const progress = Math.min(elapsed / flightDuration, 1);

    // Calculate bomb position with ballistic arc
    const start = new THREE.Vector3(...startPosition);
    const end = new THREE.Vector3(...targetPosition);
    
    // Calculate path
    const t = progress;
    const posX = start.x + (end.x - start.x) * t;
    const posZ = start.z + (end.z - start.z) * t;
    
    // Add gravity effect
    const arcHeight = 20;
    const posY = start.y + (end.y - start.y) * t - arcHeight * 4 * (t * (1 - t));
    
    // Update bomb position
    const pos = new THREE.Vector3(posX, posY, posZ);
    bombRef.current.position.copy(pos);
    
    // Rotate bomb to point downward
    bombRef.current.rotation.x = Math.min(Math.PI/2, progress * Math.PI);

    // When reaching target, explode
    if (progress >= 1) {
      console.log("Bomb reached target, exploding!");
      setHasExploded(true);
      setExplosionPosition(pos.toArray());
      setExplosionTime(state.clock.elapsedTime);
    }
  });

  return (
    <group>
      {/* Main bomb */}
      {!hasExploded && (
        <group ref={bombRef}>
          {/* Bomb body */}
          <mesh>
            <capsuleGeometry args={[0.8, 2.0, 16, 16]} />
            <meshStandardMaterial color="#222222" metalness={0.7} roughness={0.3} />
          </mesh>
          
          {/* Fins */}
          {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((angle, i) => (
            <mesh key={i} position={[0, -1, 0]} rotation={[0, angle, 0]}>
              <boxGeometry args={[0.2, 0.6, 0.8]} />
              <meshStandardMaterial color="#444444" />
            </mesh>
          ))}
          
          {/* Light to make bomb more visible */}
          <pointLight color="#ff0000" intensity={1} distance={5} />
        </group>
      )}

      {/* Smoke trail */}
      {trailPoints.current.map((point, i) => (
        <mesh key={i} position={point.position.toArray()}>
          <sphereGeometry args={[point.size, 8, 8]} />
          <meshBasicMaterial 
            color="#999999" 
            transparent={true} 
            opacity={Math.max(0, 0.8 - (Date.now()/1000 - point.time) * 0.5)} 
          />
        </mesh>
      ))}
      
      {/* Explosion effect */}
      {hasExploded && explosionPosition && (
        <group position={explosionPosition}>
          {/* Explosion light */}
          <pointLight color="#ff7700" intensity={5} distance={15} decay={2} />
          
          {/* Explosion sphere */}
          <mesh scale={[(state.clock.elapsedTime - explosionTime) * 10, 
                       (state.clock.elapsedTime - explosionTime) * 10, 
                       (state.clock.elapsedTime - explosionTime) * 10]}>
            <sphereGeometry args={[1, 16, 16]} />
            <meshBasicMaterial 
              color="orange" 
              transparent={true} 
              opacity={Math.max(0, 1 - (state.clock.elapsedTime - explosionTime))} 
            />
          </mesh>
          
          {/* Explosion particles */}
          {Array.from({ length: 15 }).map((_, i) => {
            const angle = (i / 15) * Math.PI * 2;
            const speed = 5 + Math.random() * 5;
            const elapsed = state.clock.elapsedTime - explosionTime;
            
            return (
              <mesh 
                key={i} 
                position={[
                  Math.cos(angle) * speed * elapsed,
                  Math.sin(angle) * speed * elapsed + (elapsed * elapsed * -5),
                  Math.sin(angle * 2) * speed * elapsed
                ]}
                scale={[1, 1, 1]}
              >
                <sphereGeometry args={[0.8, 8, 8]} />
                <meshBasicMaterial 
                  color={i % 2 ? "#ff7700" : "#ffaa00"} 
                  transparent={true} 
                  opacity={Math.max(0, 1 - elapsed)} 
                />
              </mesh>
            );
          })}
        </group>
      )}
    </group>
  );
};

export default DefenseBomb;