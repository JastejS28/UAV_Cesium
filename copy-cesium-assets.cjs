const fs = require('fs-extra');
const path = require('path');

// Function to copy Cesium assets to public
async function copyCesiumAssets() {
  console.log('Copying Cesium assets to public directory...');
  
  const cesiumPath = path.join(__dirname, 'node_modules', 'cesium', 'Build', 'Cesium');
  const publicCesiumPath = path.join(__dirname, 'public', 'cesium');
  
  // Ensure the directory exists
  await fs.ensureDir(publicCesiumPath);
  
  try {
    // Copy Workers
    await fs.copy(
      path.join(cesiumPath, 'Workers'),
      path.join(publicCesiumPath, 'Workers')
    );
    
    // Copy Assets
    await fs.copy(
      path.join(cesiumPath, 'Assets'),
      path.join(publicCesiumPath, 'Assets')
    );
    
    // Copy Widgets
    await fs.copy(
      path.join(cesiumPath, 'Widgets'),
      path.join(publicCesiumPath, 'Widgets')
    );
    
    console.log('Cesium assets copied successfully!');
  } catch (err) {
    console.error('Error copying Cesium assets:', err);
  }
}

copyCesiumAssets();
