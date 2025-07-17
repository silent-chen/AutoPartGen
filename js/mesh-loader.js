// GLTF Model Loading Functions

// Load GLTF model for left mesh
function loadLeftModel(modelPath) {
    const loader = new THREE.GLTFLoader();
    
    // Remove existing model
    if (leftModel) {
        leftScene.remove(leftModel);
    }
    
    loader.load(modelPath, (gltf) => {
        leftModel = gltf.scene.clone();
        
        // Scale the model
        leftModel.scale.set(1.0, 1.0, 1.0);
        
        leftScene.add(leftModel);
        
        // Make all meshes visible
        leftModel.traverse((child) => {
            if (child.isMesh) {
                child.visible = true;
            }
        });
        
        console.log('Left model loaded successfully');
    }, undefined, (error) => {
        console.error('Error loading left model:', error);
    });
}

// Load GLTF model for right mesh (explosion viewer)
function loadRightModel(modelPath) {
    const loader = new THREE.GLTFLoader();
    
    // Remove existing model
    if (rightModel) {
        rightScene.remove(rightModel);
    }
    
    loader.load(modelPath, (gltf) => {
        rightModel = gltf.scene.clone();
        
        // Scale the model
        rightModel.scale.set(1.0, 1.0, 1.0);
        
        rightScene.add(rightModel);
        
        // Make all meshes visible
        rightModel.traverse((child) => {
            if (child.isMesh) {
                child.visible = true;
            }
        });
        
        // Reset explosion
        applyExplodeEffect(0);
        
        console.log('Right model loaded successfully');
    }, undefined, (error) => {
        console.error('Error loading right model:', error);
    });
}

// Load default models
function loadDefaultModels() {
    setTimeout(() => {
        loadLeftModel('resources/image_to_parts/glbs/crab.glb');
        loadRightModel('resources/image_to_parts/glbs/crab.glb');
    }, 100);
} 