import { create } from 'zustand';

export const useEnvironmentStore = create((set) => ({
  environmentMode: 'day', // 'day', 'night', or 'rain'
  
  setEnvironmentMode: (mode) => {
    if (mode === 'day' || mode === 'night' || mode === 'rain') {
      console.log("Setting environment mode to:", mode);
      set({ environmentMode: mode });
    } else {
      console.error("Invalid environment mode:", mode);
    }
  }
}));