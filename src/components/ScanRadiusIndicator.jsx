import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';
import * as THREE from 'three';

const SCAN_RADIUS = 20; // Matching the detection radius in other components

const ScanRadiusIndicator = () => {
  const { position: uavPosition } = useUAVStore();
  const sphereRef = useRef(null);

  useFrame(() => {
    if (sphereRef.current) {
      // Update the sphere's position to match the UAV's
      sphereRef.current.position.set(uavPosition[0], uavPosition[1], uavPosition[2]);
    }
  });

  return (
    <mesh ref={sphereRef}>
      <sphereGeometry args={[SCAN_RADIUS, 32, 16]} />
      <meshBasicMaterial color="yellow" opacity={0.2} transparent={true} />
    </mesh>
  );
};

export default ScanRadiusIndicator;