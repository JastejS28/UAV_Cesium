import { useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CesiumTerrain = () => {
  const { camera } = useThree();

  useFrame(() => {
    if (window.cesiumViewer) {
      const cesiumViewer = window.cesiumViewer;
      const cesiumCamera = cesiumViewer.camera;

      // More robust check to ensure Cesium camera is fully initialized
      if (
        cesiumCamera &&
        cesiumCamera.position &&
        cesiumCamera.direction &&
        cesiumCamera.up &&
        cesiumCamera.frustum
      ) {
        // Match Three.js camera to Cesium camera
        camera.position.copy(cesiumCamera.position);

        // Create a target point in the direction of the camera
        const target = new THREE.Vector3().addVectors(
          cesiumCamera.position,
          cesiumCamera.direction
        );
        camera.lookAt(target);
        
        camera.up.copy(cesiumCamera.up);

        camera.fov = THREE.MathUtils.radToDeg(cesiumCamera.frustum.fovy);
        camera.aspect = cesiumCamera.frustum.aspectRatio;
        camera.near = cesiumCamera.frustum.near;
        camera.far = cesiumCamera.frustum.far;

        camera.updateProjectionMatrix();
      }
    }
  });

  return null; // This component doesn't render anything itself
};

export default CesiumTerrain;
