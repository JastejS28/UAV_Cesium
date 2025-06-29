import React, { useRef, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { useUAVStore } from '../store/uavStore';

// This is the original terrain component, kept as a fallback
const FallbackTerrain = () => {
  const { scene: loadedGltfScene } = useGLTF('/models/mountain/terrain.glb');
  const { isThermalVision } = useUAVStore();
  const sceneInstanceRef = useRef(null);
  const originalMaterialsRef = useRef(new Map());

  const terrainScale = 100;

  useEffect(() => {
    if (loadedGltfScene) {
      // Clone the scene to avoid modifying the cached original
      const clonedScene = loadedGltfScene.clone();
      sceneInstanceRef.current = clonedScene;
      
      // Store original materials for later use
      clonedScene.traverse((child) => {
        if (child.isMesh) {
          originalMaterialsRef.current.set(child.uuid, child.material.clone());
        }
      });
    }
  }, [loadedGltfScene]);

  // Update materials when thermal vision changes
  useEffect(() => {
    if (!sceneInstanceRef.current) return;
    
    sceneInstanceRef.current.traverse((child) => {
      if (child.isMesh) {
        if (isThermalVision) {
          // Apply thermal vision material
          child.material.color.set(0x001133);
          child.material.emissive.set(0x000000);
          child.material.emissiveIntensity = 0;
        } else {
          // Restore original material
          const originalMaterial = originalMaterialsRef.current.get(child.uuid);
          if (originalMaterial) {
            child.material = originalMaterial.clone();
          }
        }
      }
    });
  }, [isThermalVision]);

  if (!sceneInstanceRef.current) {
    return null;
  }

  return (
    <primitive
      object={sceneInstanceRef.current} 
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={[terrainScale, terrainScale, terrainScale]}
      receiveShadow
      castShadow
    />
  );
};

useGLTF.preload('/models/mountain/terrain.glb');
export default FallbackTerrain;
