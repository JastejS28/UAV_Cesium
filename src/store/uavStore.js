import { create } from 'zustand';

export const useUAVStore = create((set, get) => ({
  // UAV state - using Cesium-compatible coordinates
  position: [-122.4194, 100, 37.7749], // [longitude, altitude, latitude] for Cesium compatibility
  rotation: [0, 0, 0],
  speed: 0,
  altitude: 100, 
  lateralMovement: 0,
  
  // Target position for smooth movement
  targetPosition: null,
  
  // Environment state
  isDayTime: true,
  isThermalVision: false,
  
  // Target data
  targets: [],
  
  // UAV functions
  setSpeed: (newSpeed) => set({ speed: newSpeed }),
  setAltitude: (newAltitude) => set({ altitude: newAltitude }),
  setLateralMovement: (newLateralMovement) => set({ lateralMovement: newLateralMovement }),
  setRotation: (newRotation) => set({ rotation: newRotation }),
  
  // Position setting with Cesium coordinate conversion
  setPosition: (newPosition) => {
    // Ensure position is in [longitude, altitude, latitude] format for Cesium
    const cesiumPosition = Array.isArray(newPosition) && newPosition.length === 3 
      ? newPosition 
      : [-122.4194, 100, 37.7749];
    
    set({ position: cesiumPosition });
  },
  
  // Only set targetPosition when we want to move to a new location
  setTargetPosition: (newTarget) => set({ targetPosition: newTarget }),
  
  // Environment functions
  toggleDayTime: () => set((state) => ({ isDayTime: !state.isDayTime })),
  setThermalVision: (value) => set({ isThermalVision: value }),
  
  // Target functions
  addTarget: (newTarget) => set(state => ({
    targets: [...state.targets, newTarget]
  })),
  
  // Coordinate conversion helpers
  toThreeJSCoords: (cesiumCoords) => {
    // Convert [longitude, altitude, latitude] to Three.js [x, y, z]
    return [
      (cesiumCoords[0] + 122.4194) * 1000, // longitude to x
      cesiumCoords[1], // altitude to y
      (cesiumCoords[2] - 37.7749) * 1000  // latitude to z
    ];
  },
  
  toCesiumCoords: (threeCoords) => {
    // Convert Three.js [x, y, z] to [longitude, altitude, latitude]
    return [
      threeCoords[0] * 0.001 - 122.4194, // x to longitude
      threeCoords[1], // y to altitude
      threeCoords[2] * 0.001 + 37.7749   // z to latitude
    ];
  },
}));