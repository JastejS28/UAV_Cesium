const fs = require('fs-extra');
const path = require('path');

async function copyCesiumAssets() {
  try {
    console.log('Copying Cesium assets...');
    
    const cesiumSource = path.join(__dirname, 'node_modules', 'cesium', 'Build', 'Cesium');
    const cesiumDest = path.join(__dirname, 'public', 'cesium');
    
    // Check if source exists
    if (!await fs.pathExists(cesiumSource)) {
      console.warn('Cesium source directory not found:', cesiumSource);
      return;
    }
    
    // Ensure destination directory exists
    await fs.ensureDir(cesiumDest);
    
    // Copy Cesium assets
    await fs.copy(cesiumSource, cesiumDest, {
      overwrite: true,
      filter: (src, dest) => {
        // Skip copying certain files that might cause issues
        const relativePath = path.relative(cesiumSource, src);
        
        // Skip node_modules if they exist in cesium build
        if (relativePath.includes('node_modules')) {
          return false;
        }
        
        return true;
      }
    });
    
    console.log('Cesium assets copied successfully!');
  } catch (error) {
    console.error('Error copying Cesium assets:', error);
    process.exit(1);
  }
}

copyCesiumAssets();