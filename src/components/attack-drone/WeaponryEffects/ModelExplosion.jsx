import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ModelExplosion = ({ position, id, skipSound = false }) => {
  const explosionRef = useRef();
  const startTime = useRef(Date.now());
  const [finished, setFinished] = useState(false);
  
  // Create and play explosion sound
  useEffect(() => {
    // Set a timeout to remove the explosion
    const timer = setTimeout(() => {
      setFinished(true);
    }, 3000);
    
    // Only play sound if skipSound is false
    if (!skipSound) {
      // Try to play explosion sound
      try {
        const audio = new Audio('/sounds/explosion.mp3');
        audio.volume = 0.7;
        audio.play().catch(e => {
          console.log('Failed to play explosion sound:', e.message);
        });
      } catch (error) {
        console.log("Error playing explosion sound:", error.message);
      }
    }
    
    return () => {
      clearTimeout(timer);
    };
  }, [skipSound]);

  // Animate the explosion
  useFrame(() => {
    if (finished || !explosionRef.current) return;
    
    const elapsed = (Date.now() - startTime.current) / 1000;
    
    // Scale animation
    const baseScale = 0.2;
    const maxScale = 1.2;
    const scale = Math.min(maxScale, baseScale + (elapsed < 0.5 ? elapsed * 2 : 0.5 * 2 + (elapsed - 0.5) * 0.8));
    
    if (explosionRef.current) {
      explosionRef.current.position.set(...position);
      explosionRef.current.scale.set(scale, scale, scale);
      
      // Fade out near the end
      if (elapsed > 2.0) {
        const fadeOut = 1 - ((elapsed - 2.0) / 1.0);
        explosionRef.current.traverse(child => {
          if (child.material) {
            child.material.opacity = fadeOut;
            child.material.transparent = true;
          }
        });
      }
    }
  });

  if (finished) return null;

  // Use a simple sphere as explosion effect since model loading might fail
  return (
    <group ref={explosionRef} position={position}>
      {/* Main explosion sphere */}
      <mesh>
        <sphereGeometry args={[2, 16, 16]} />
        <meshBasicMaterial color="#FF6600" transparent opacity={0.8} />
      </mesh>
      
      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#FFFF00" transparent opacity={0.9} />
      </mesh>
      
      {/* Outer smoke */}
      <mesh>
        <sphereGeometry args={[3, 16, 16]} />
        <meshBasicMaterial color="#444444" transparent opacity={0.3} />
      </mesh>
      
      {/* Point light for illumination */}
      <pointLight color="#FF6600" intensity={5} distance={20} decay={2} />
    </group>
  );
};

export default ModelExplosion;