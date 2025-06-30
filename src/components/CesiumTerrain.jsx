import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const CesiumTerrain = () => {
  const { camera } = useThree();
  const { position: uavPosition } = useUAVStore();
  const cesiumReadyRef = useRef(false);
  const lastUpdateTime = useRef(0);
  const initializationAttempted = useRef(false);

  // Wait for Cesium to be ready
  useEffect(() => {
    const handleCesiumReady = () => {
      console.log('Cesium is ready for Three.js integration');
      cesiumReadyRef.current = true;
    };

    const checkCesiumStatus = () => {
      if (window.cesiumError) {
        console.error('Cesium failed to initialize:', window.cesiumError);
        return;
      }

      if (window.cesiumInitialized && window.cesiumViewer) {
        handleCesiumReady();
      } else if (!initializationAttempted.current) {
        initializationAttempted.current = true;
        // Wait a bit more for Cesium to initialize
        setTimeout(checkCesiumStatus, 1000);
      }
    };

    // Check immediately
    checkCesiumStatus();

    // Also listen for the custom event
    window.addEventListener('cesiumReady', handleCesiumReady);

    return () => {
      window.removeEventListener('cesiumReady', handleCesiumReady);
    };
  }, []);

  // Convert UAV position to Cesium coordinates and update camera
  useFrame((state) => {
    if (!cesiumReadyRef.current || !window.cesiumViewer || !uavPosition) return;

    const now = state.clock.elapsedTime;
    // Throttle updates to avoid performance issues
    if (now - lastUpdateTime.current < 0.1) return; // 10fps for camera updates
    lastUpdateTime.current = now;

    try {
      const cesiumViewer = window.cesiumViewer;
      const cesiumCamera = cesiumViewer.camera;

      // UAV position is already in Cesium coordinates [longitude, altitude, latitude]
      const uavLongitude = uavPosition[0];
      const uavLatitude = uavPosition[2];
      const uavHeight = Math.max(uavPosition[1], 100); // Minimum 100m altitude

      // Update Cesium camera to follow UAV with offset
      const cameraOffset = {
        longitude: uavLongitude,
        latitude: uavLatitude - 0.001, // Slightly south of UAV
        height: uavHeight + 200 // 200m above UAV
      };

      const destination = Cesium.Cartesian3.fromDegrees(
        cameraOffset.longitude,
        cameraOffset.latitude,
        cameraOffset.height
      );

      // Look at UAV position
      const uavCartesian = Cesium.Cartesian3.fromDegrees(
        uavLongitude,
        uavLatitude,
        uavHeight
      );

      // Calculate direction from camera to UAV
      const direction = Cesium.Cartesian3.subtract(
        uavCartesian,
        destination,
        new Cesium.Cartesian3()
      );
      Cesium.Cartesian3.normalize(direction, direction);

      // Smooth camera movement
      cesiumCamera.setView({
        destination: destination,
        orientation: {
          direction: direction,
          up: Cesium.Cartesian3.UNIT_Z,
        },
      });

      // Sync Three.js camera with Cesium camera for consistent rendering
      if (cesiumCamera.position && cesiumCamera.direction && cesiumCamera.up) {
        // Convert Cesium camera position to Three.js world coordinates
        const cesiumPos = cesiumCamera.position;
        const cesiumDir = cesiumCamera.direction;
        const cesiumUp = cesiumCamera.up;

        // Update Three.js camera position
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
          camera.far = cesiumCamera.frustum.far || 100000;
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