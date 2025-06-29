/**
 * Cesium Debugger Tool
 * This script helps diagnose and fix common Cesium visibility issues.
 */

(function() {
  // Wait for DOM to be ready
  document.addEventListener('DOMContentLoaded', function() {
    console.log("[Cesium Debugger] Starting up...");
    
    // Wait a bit to let Cesium initialize
    setTimeout(function() {
      // Check for Cesium viewer
      if (!window.cesiumViewer) {
        console.warn("[Cesium Debugger] Cesium viewer not found in window object");
        return;
      }
      
      // Force important visibility settings
      forceCesiumVisibility();
      
      // Set up monitoring
      monitorCesiumVisibility();
      
      console.log("[Cesium Debugger] Setup complete");
    }, 2000);
  });
  
  // Function to force Cesium visibility
  function forceCesiumVisibility() {
    // Get important elements
    const cesiumContainer = document.getElementById('cesium-container');
    const cesiumCanvas = document.querySelector('.cesium-viewer canvas');
    
    // Ensure container is visible
    if (cesiumContainer) {
      cesiumContainer.style.visibility = 'visible';
      cesiumContainer.style.opacity = '1';
      cesiumContainer.style.display = 'block';
      console.log("[Cesium Debugger] Forced cesium-container to visible");
    } else {
      console.warn("[Cesium Debugger] Could not find cesium-container");
    }
    
    // Ensure canvas is visible
    if (cesiumCanvas) {
      cesiumCanvas.style.visibility = 'visible';
      cesiumCanvas.style.opacity = '1';
      cesiumCanvas.style.display = 'block';
      console.log("[Cesium Debugger] Forced cesium canvas to visible");
    } else {
      console.warn("[Cesium Debugger] Could not find cesium canvas");
    }
    
    // Fix scene settings
    const viewer = window.cesiumViewer;
    if (viewer && viewer.scene) {
      viewer.scene.globe.show = true;
      viewer.scene.globe.alpha = 1.0;
      viewer.scene.requestRenderMode = false;
      viewer.scene.backgroundColor = Cesium.Color.ALICEBLUE;
      console.log("[Cesium Debugger] Forced scene settings");
    }
  }
  
  // Function to monitor Cesium visibility
  function monitorCesiumVisibility() {
    // Check visibility every second
    setInterval(function() {
      const cesiumContainer = document.getElementById('cesium-container');
      const cesiumCanvas = document.querySelector('.cesium-viewer canvas');
      
      if (cesiumContainer) {
        const containerVisible = 
          cesiumContainer.style.visibility !== 'hidden' && 
          cesiumContainer.style.display !== 'none' &&
          cesiumContainer.style.opacity !== '0';
        
        if (!containerVisible) {
          console.warn("[Cesium Debugger] cesium-container has become invisible! Fixing...");
          forceCesiumVisibility();
        }
      }
      
      if (cesiumCanvas) {
        const canvasVisible = 
          cesiumCanvas.style.visibility !== 'hidden' && 
          cesiumCanvas.style.display !== 'none' &&
          cesiumCanvas.style.opacity !== '0';
        
        if (!canvasVisible) {
          console.warn("[Cesium Debugger] cesium canvas has become invisible! Fixing...");
          forceCesiumVisibility();
        }
      }
      
      // Check scene rendering
      if (window.cesiumViewer && window.cesiumViewer.scene) {
        if (!window.cesiumViewer.scene.globe.show) {
          console.warn("[Cesium Debugger] Globe visibility has been disabled! Fixing...");
          window.cesiumViewer.scene.globe.show = true;
          window.cesiumViewer.scene.requestRender();
        }
      }
    }, 1000);
  }
})();
