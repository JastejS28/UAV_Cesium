import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const CesiumTerrain = () => {
  const { camera, scene } = useThree();
  const { position: uavPosition } = useUAVStore();
  const cesiumReadyRef = useRef(false);
  const lastUpdateTime = useRef(0);

  // Wait for Cesium to be ready
  useEffect(() => {
    const handleCesiumReady = () => {
      console.log('Cesium is ready for Three.js integration');
      cesiumReadyRef.current = true;
    };

    if (window.cesiumInitialized) {
      handleCesiumReady();
    } else {
      window.addEventListener('cesiumReady', handleCesiumReady);
    }

    return () => {
      window.removeEventListener('cesiumReady', handleCesiumReady);
    };
  }, []);

  // Convert UAV position to Cesium coordinates and update camera
  useFrame((state) => {
    if (!cesiumReadyRef.current || !window.cesiumViewer || !uavPosition) return;

    const now = state.clock.elapsedTime;
    // Throttle updates to avoid performance issues
    if (now - lastUpdateTime.current < 0.016) return; // ~60fps
    lastUpdateTime.current = now;

    try {
      const cesiumViewer = window.cesiumViewer;
      const cesiumCamera = cesiumViewer.camera;

      // Convert UAV world coordinates to Cesium coordinates
      // Assuming UAV coordinates are in a local coordinate system
      // You may need to adjust this conversion based on your coordinate system
      const uavLongitude = uavPosition[0] * 0.001 - 122.4194; // Scale and offset
      const uavLatitude = uavPosition[2] * 0.001 + 37.7749;   // Scale and offset
      const uavHeight = Math.max(uavPosition[1] * 10, 100);   // Scale height, minimum 100m

      // Update Cesium camera to follow UAV
      const destination = Cesium.Cartesian3.fromDegrees(
        uavLongitude,
        uavLatitude,
        uavHeight + 50 // Camera slightly above UAV
      );

      // Smooth camera movement
      cesiumCamera.setView({
        destination: destination,
        orientation: {
          heading: Cesium.Math.toRadians(0.0),
          pitch: Cesium.Math.toRadians(-15.0),
          roll: 0.0,
        },
      });

      // Sync Three.js camera with Cesium camera for consistent rendering
      if (cesiumCamera.position && cesiumCamera.direction && cesiumCamera.up) {
        // Convert Cesium camera position to Three.js coordinates
        const cesiumPos = cesiumCamera.position;
        const cesiumDir = cesiumCamera.direction;
        const cesiumUp = cesiumCamera.up;

        // Update Three.js camera
        camera.position.copy(cesiumPos);
        
        // Calculate look-at target
        const target = new THREE.Vector3().addVectors(
          cesiumPos,
          cesiumDir
        );
        camera.lookAt(target);
        camera.up.copy(cesiumUp);

        // Update camera properties
        if (cesiumCamera.frustum) {
          camera.fov = THREE.MathUtils.radToDeg(cesiumCamera.frustum.fovy || Math.PI / 4);
          camera.aspect = cesiumCamera.frustum.aspectRatio || (window.innerWidth / window.innerHeight);
          camera.near = cesiumCamera.frustum.near || 0.1;
          camera.far = cesiumCamera.frustum.far || 10000;
          camera.updateProjectionMatrix();
        }
      }
    } catch (error) {
      console.warn('Error syncing cameras:', error);
    }
  });

  return null; // This component doesn't render anything itself
};

export default CesiumTerrain;