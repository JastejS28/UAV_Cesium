import React, { useRef, useEffect } from 'react';
import { useUAVStore } from '../store/uavStore';
import { useEnvironmentStore } from '../store/environmentStore';
import * as THREE from 'three';

const LiveCameraView = ({ width = 400, height = 225 }) => {
  const canvasRef = useRef();
  const rendererRef = useRef();
  const sceneRef = useRef(new THREE.Scene());
  const cameraRef = useRef();
  const animationFrameIdRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    console.log('[LiveCameraView] Setting up camera view...');

    // Initialize Three.js renderer for the live view
    rendererRef.current = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    rendererRef.current.setSize(width, height);
    rendererRef.current.setPixelRatio(window.devicePixelRatio);
    rendererRef.current.setClearColor(0x87CEEB); // Sky blue background

    // Create camera for live view
    cameraRef.current = new THREE.PerspectiveCamera(60, width / height, 0.1, 10000);

    // Add basic lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    sceneRef.current.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 5);
    sceneRef.current.add(directionalLight);

    // Add a simple ground plane for reference
    const groundGeometry = new THREE.PlaneGeometry(1000, 1000);
    const groundMaterial = new THREE.MeshLambertMaterial({ color: 0x90EE90 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    sceneRef.current.add(ground);

    const animate = () => {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      
      if (!rendererRef.current || !cameraRef.current || !sceneRef.current) return;

      const { position: uavPosition, rotation: uavRotation, isThermalVision } = useUAVStore.getState();
      const { environmentMode } = useEnvironmentStore.getState();

      if (uavPosition && uavRotation) {
        // Position camera at UAV location
        cameraRef.current.position.set(
          uavPosition[0],
          uavPosition[1],
          uavPosition[2]
        );

        // Apply UAV rotation to camera
        cameraRef.current.rotation.set(
          uavRotation[0],
          uavRotation[1],
          uavRotation[2]
        );
      }

      // Adjust rendering based on thermal vision and environment
      if (isThermalVision) {
        rendererRef.current.setClearColor(0x000022);
        // Apply thermal effect to scene objects
        sceneRef.current.traverse((object) => {
          if (object.isMesh && object.material) {
            object.material.emissive = new THREE.Color(0x440000);
          }
        });
      } else {
        // Reset materials
        sceneRef.current.traverse((object) => {
          if (object.isMesh && object.material) {
            object.material.emissive = new THREE.Color(0x000000);
          }
        });

        switch(environmentMode) {
          case 'night': 
            rendererRef.current.setClearColor(0x000011); 
            break;
          case 'rain': 
            rendererRef.current.setClearColor(0x404050); 
            break;
          case 'day':
          default:
            rendererRef.current.setClearColor(0x87CEEB); 
            break;
        }
      }

      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    animate();

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      console.log('[LiveCameraView] Cleaned up.');
    };
  }, [width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: '8px',
        border: '2px solid #555',
        position: 'relative',
        zIndex: 5,
        background: '#000'
      }}
    />
  );
};

export default LiveCameraView;