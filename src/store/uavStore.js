import { create } from 'zustand';

export const useUAVStore = create((set) => ({
  // UAV state
  position: [-45, 30, -40],
  rotation: [0, 0, 0],
  speed: 0,
  altitude: 0, 
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
  
  // Fix position setting - don't update targetPosition here
  setPosition: (newPosition) => set({ position: newPosition }),
  
  // Only set targetPosition when we want to move to a new location
  setTargetPosition: (newTarget) => set({ targetPosition: newTarget }),
  
  // Environment functions
  toggleDayTime: () => set((state) => ({ isDayTime: !state.isDayTime })),
  setThermalVision: (value) => set({ isThermalVision: value }),
  
  // Target functions
  addTarget: (newTarget) => set(state => ({
    targets: [...state.targets, newTarget]
  })),
}));

