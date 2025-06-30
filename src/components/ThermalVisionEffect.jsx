import * as THREE from 'three';
import React, { useEffect } from 'react';
import { useThree } from '@react-three/fiber';
import { useUAVStore } from '../store/uavStore';

// JS-side color constants (matching GLSL values)
const C_RED = new THREE.Color(0.95, 0.1, 0.05);
const C_YELLOW = new THREE.Color(0.9, 0.9, 0.1);
const C_BLUE = new THREE.Color(0.0, 0.1, 0.7);

// Vertex Shader
const thermalVertexShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  void main() {
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Fragment Shader
const thermalFragmentShader = `
  varying vec3 vWorldPosition;
  varying vec3 vNormal;

  uniform float minHeight;
  uniform float maxHeight;
  uniform float noiseFactor;

  float rand(vec2 co){
      return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
  }

  const vec3 C_COLD_DARK_BLUE = vec3(0.0, 0.0, 0.25);
  const vec3 C_BLUE         = vec3(0.0, 0.1, 0.7);
  const vec3 C_CYAN_GREEN   = vec3(0.1, 0.6, 0.5);
  const vec3 C_GREEN_YELLOW = vec3(0.3, 0.8, 0.15);
  const vec3 C_YELLOW       = vec3(0.9, 0.9, 0.1);
  const vec3 C_ORANGE       = vec3(1.0, 0.5, 0.0);
  const vec3 C_RED          = vec3(0.95, 0.1, 0.05);
  const vec3 C_HOT_WHITE    = vec3(1.0, 1.0, 0.95);

  vec3 getThermalColor(float tempValue) {
      tempValue = clamp(tempValue, 0.0, 1.0);

      if (tempValue < 0.16) return mix(C_COLD_DARK_BLUE, C_BLUE, tempValue / 0.16);
      else if (tempValue < 0.32) return mix(C_BLUE, C_CYAN_GREEN, (tempValue - 0.16) / 0.16);
      else if (tempValue < 0.48) return mix(C_CYAN_GREEN, C_GREEN_YELLOW, (tempValue - 0.32) / 0.16);
      else if (tempValue < 0.64) return mix(C_GREEN_YELLOW, C_YELLOW, (tempValue - 0.48) / 0.16);
      else if (tempValue < 0.80) return mix(C_YELLOW, C_ORANGE, (tempValue - 0.64) / 0.16);
      else if (tempValue < 0.95) return mix(C_ORANGE, C_RED, (tempValue - 0.80) / 0.15);
      else return mix(C_RED, C_HOT_WHITE, (tempValue - 0.95) / 0.05);
  }

  void main() {
    float heightRange = max(0.001, maxHeight - minHeight);
    float heightRatio = (vWorldPosition.y - minHeight) / heightRange;

    float noise = (rand(vWorldPosition.xz * 0.1) - 0.5) * noiseFactor;
    float temperature = clamp(heightRatio + noise, 0.0, 1.0);

    vec3 finalColor = getThermalColor(temperature);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

// Terrain Thermal Shader Material
const terrainThermalShaderMaterial = new THREE.ShaderMaterial({
  uniforms: {
    minHeight: { value: 0.0 },
    maxHeight: { value: 1.0 },
    noiseFactor: { value: 0.15 },
  },
  vertexShader: thermalVertexShader,
  fragmentShader: thermalFragmentShader,
  side: THREE.DoubleSide,
});

// Export materials used in thermal vision
export const THERMAL_MATERIALS = {
  terrain: terrainThermalShaderMaterial,
  hot: new THREE.MeshBasicMaterial({ color: C_RED }),
  medium: new THREE.MeshBasicMaterial({ color: C_YELLOW }),
  cool: new THREE.MeshBasicMaterial({ color: C_BLUE }),
};

// Component that adds a thermal overlay when thermal vision is active
const ThermalVisionEffect = () => {
  const { isThermalVision } = useUAVStore();
  const { gl } = useThree();
  
  useEffect(() => {
    // Handle Cesium viewer thermal vision overlay
    if (window.cesiumViewer) {
      try {
        const cesiumContainer = document.getElementById('cesium-container');
        if (cesiumContainer) {
          if (isThermalVision) {
            // Apply thermal filter to Cesium
            cesiumContainer.style.filter = 'sepia(90%) hue-rotate(180deg) contrast(150%) brightness(70%) saturate(200%)';
            cesiumContainer.style.transition = 'filter 0.3s ease';
          } else {
            // Remove thermal filter from Cesium
            cesiumContainer.style.filter = '';
          }
        }
      } catch (e) {
        console.error("Error updating Cesium thermal vision:", e);
      }
    }
    
    // Update Three.js scene rendering
    if (isThermalVision) {
      gl.setClearColor(0x000022, 0); // Keep transparent for Cesium
    } else {
      gl.setClearColor(0x000000, 0); // Transparent when not in thermal mode
    }
  }, [isThermalVision, gl]);
  
  return null;
};

export default ThermalVisionEffect;