import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const DestroyedTarget = ({ position, targetType, rotation = [0, 0, 0] }) => {
  const groupRef = useRef();
  
  // Generate debris pieces based on target type
  const debrisPieces = React.useMemo(() => {
    const pieces = [];
    
    // Number and size based on target type
    const config = {
      'tank': { count: 12, size: 1.0, baseColor: '#3a3a3a' },
      'jeep': { count: 8, size: 0.8, baseColor: '#4a4a4a' },
      'warehouse': { count: 15, size: 1.5, baseColor: '#5a5a5a' },
      'default': { count: 10, size: 1.0, baseColor: '#3a3a3a' }
    };
    
    const { count, size, baseColor } = config[targetType] || config.default;
    
    // Create debris pieces
    for (let i = 0; i < count; i++) {
      const scale = Math.random() * 0.5 + 0.5;
      pieces.push({
        position: [
          (Math.random() - 0.5) * 3,
          Math.random() * 1.5,
          (Math.random() - 0.5) * 3
        ],
        rotation: [
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        ],
        scale: [scale * size, scale * size, scale * size],
        color: new THREE.Color(baseColor).offsetHSL(0, 0, (Math.random() - 0.5) * 0.2)
      });
    }
    
    return pieces;
  }, [targetType]);

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Central destroyed hull */}
      {targetType === 'tank' && (
        <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI/6, Math.PI/12]}>
          <boxGeometry args={[2.5, 0.8, 4.5]} />
          <meshStandardMaterial color="#333333" roughness={0.9} />
          
          {/* Broken turret */}
          <mesh position={[0.8, 1, -0.5]} rotation={[0.5, 0.3, 0.7]}>
            <boxGeometry args={[1.5, 0.7, 2]} />
            <meshStandardMaterial color="#3a3a3a" roughness={0.85} />
          </mesh>
          
          {/* Broken gun barrel */}
          <mesh position={[1.5, 0.8, -1.8]} rotation={[0, 0, Math.PI/3]}>
            <cylinderGeometry args={[0.1, 0.1, 2, 8]} />
            <meshStandardMaterial color="#444444" roughness={0.7} />
          </mesh>
        </mesh>
      )}
      
      {targetType === 'jeep' && (
        <mesh position={[0, 0.3, 0]} rotation={[0, 0, Math.PI/8]}>
          <boxGeometry args={[1.8, 0.7, 3]} />
          <meshStandardMaterial color="#3a3a3a" roughness={0.9} />
        </mesh>
      )}
      
      {targetType === 'warehouse' && (
        <group position={[0, 1, 0]}>
          <mesh rotation={[Math.PI/12, 0, Math.PI/20]}>
            <boxGeometry args={[4, 2, 5]} />
            <meshStandardMaterial color="#5a5a5a" roughness={0.9} />
          </mesh>
        </group>
      )}
      
      {/* Scattered debris pieces */}
      {debrisPieces.map((piece, i) => (
        <mesh
          key={`debris-${i}`}
          position={piece.position}
          rotation={piece.rotation}
          scale={piece.scale}
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial 
            color={piece.color} 
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
};

export default DestroyedTarget;