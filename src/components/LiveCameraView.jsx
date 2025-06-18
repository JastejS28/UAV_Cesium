import React, { useRef, useEffect } from 'react';
import { useUAVStore } from '../store/uavStore';
import { useEnvironmentStore } from '../store/environmentStore'; // To know the main environment
import { useGLTF } from '@react-three/drei';
import { THERMAL_MATERIALS } from './ThermalVisionEffect'; // Ensure this path is correct
import * as THREE from 'three'; // Use *_THREE

const DAY_SKY_COLOR = new THREE.Color(0xFFFFFF); // Define Day Sky Color
const NIGHT_SKY_COLOR = new THREE.Color(0x000000);
const RAIN_SKY_COLOR = new THREE.Color(0x404050);
const THERMAL_SKY_COLOR = new THREE.Color(0x000000);

const LiveCameraView = ({ width = 400, height = 225 }) => {
  const canvasRef = useRef();
  const customSceneRef = useRef(new THREE.Scene());
  const customCameraRef = useRef();
  const rendererRef = useRef();
  const animationFrameIdRef = useRef();

  // Load the terrain model for the live view
  const { scene: loadedTerrainModel } = useGLTF('/models/mountain/terrain.glb'); // Load model here too
  const liveTerrainInstanceRef = useRef(null);
  const liveTerrainOriginalMaterials = useRef(new Map()); // For this instance's original materials

  const terrainScale = 100; // Consistent scale

  // Effect for scene setup (runs once)
  useEffect(() => {
    if (!canvasRef.current || !loadedTerrainModel) return;

    console.log('[LiveCameraView] Setting up scene...');

    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current.setSize(width, height);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    // Initial clear color, will be updated in animate loop
    rendererRef.current.setClearColor(DAY_SKY_COLOR); 

    customCameraRef.current = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000); // Increased far plane

    // Lighting for the live camera scene (consistent "day-like" lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    customSceneRef.current.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8);
    directionalLight.position.set(10, 15, 10); // Adjusted light position
    customSceneRef.current.add(directionalLight);

    // Clone the loaded terrain model for use in this scene
    if (loadedTerrainModel && !liveTerrainInstanceRef.current) {
      console.log('[LiveCameraView] Cloning terrain model...');
      const terrainClone = loadedTerrainModel.clone(true);
      // Apply scale directly to the clone for this scene
      terrainClone.scale.set(terrainScale, terrainScale, terrainScale);
      terrainClone.position.set(0, 0, 0); // Position at origin of custom scene

      const materialsMap = new Map();
      terrainClone.traverse((node) => {
        if (node.isMesh && node.material) {
          materialsMap.set(node.uuid, node.material.clone());
        }
      });
      liveTerrainOriginalMaterials.current = materialsMap;
      liveTerrainInstanceRef.current = terrainClone;
      customSceneRef.current.add(liveTerrainInstanceRef.current);
      console.log('[LiveCameraView] Terrain model added to custom scene.');
      // No need to set uniforms here, as THERMAL_MATERIALS.terrain is shared and configured by Terrain.jsx
    }

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      if (!rendererRef.current || !customCameraRef.current || !customSceneRef.current || !liveTerrainInstanceRef.current) return;

      const { position: uavPosition, rotation: uavRotation, isThermalVision } = useUAVStore.getState();
      const { environmentMode } = useEnvironmentStore.getState();

      const uavWorldPosition = new THREE.Vector3().fromArray(uavPosition);
      const uavWorldEuler = new THREE.Euler().fromArray(uavRotation);

      customCameraRef.current.position.copy(uavWorldPosition);
      customCameraRef.current.rotation.copy(uavWorldEuler);
      
      if (liveTerrainInstanceRef.current) { // Check if terrain instance exists
        liveTerrainInstanceRef.current.traverse((node) => {
          if (node.isMesh) {
            if (isThermalVision) {
              if (node.material !== THERMAL_MATERIALS.terrain) {
                // console.log('[LiveCameraView] Applying THERMAL material to terrain.');
                node.material = THERMAL_MATERIALS.terrain;
              }
            } else {
              const originalMat = liveTerrainOriginalMaterials.current.get(node.uuid);
              if (originalMat && node.material !== originalMat) {
                // console.log('[LiveCameraView] Restoring ORIGINAL material to terrain.');
                node.material = originalMat;
              } else if (!originalMat) {
                // console.warn(`[LiveCameraView] No original material for mesh ${node.uuid}`);
              }
            }
          }
        });
      }
      
      // Adjust background color based on thermal/environment (optional, simple sky)
      if (isThermalVision) {
        rendererRef.current.setClearColor(THERMAL_SKY_COLOR);
      } else {
        switch(environmentMode) {
          case 'night': 
            rendererRef.current.setClearColor(NIGHT_SKY_COLOR); 
            break;
          case 'rain': 
            rendererRef.current.setClearColor(RAIN_SKY_COLOR); 
            break;
          case 'day': // Explicitly set day sky color
          default:
            rendererRef.current.setClearColor(DAY_SKY_COLOR); 
            break;
        }
      }

      rendererRef.current.render(customSceneRef.current, customCameraRef.current);
    };
    animate();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      console.log('[LiveCameraView] Cleaned up.');
    };
  }, [width, height, loadedTerrainModel, terrainScale]); // Added terrainScale

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '8px',
        border: '1px solid #555',
        // Add these styles to prevent any controls from showing
        position: 'relative',
        zIndex: 5
      }}
      // If this is part of a video element or has controls
      // controls={false}
    />
  );
};

useGLTF.preload('/models/mountain/terrain.glb'); // Preload for LiveCameraView as well

export default LiveCameraView;