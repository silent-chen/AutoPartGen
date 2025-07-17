// Explosion Effect Functions

function applyExplodeEffect(explodeAmount) {
    applyExplodeToModel(rightModel, explodeAmount);
}

function applyExplodeToModel(model, explodeAmount) {
    if (!model) return;
    
    const root = model.children[0];
    if (!root || !root.children) return;
    
    root.children.forEach((part, index) => {
        const bbox = new THREE.Box3().setFromObject(part);
        const center = bbox.getCenter(new THREE.Vector3());
        const direction = center.clone().sub(new THREE.Vector3(0, 0, 0)).normalize();
        
        const originalPosition = new THREE.Vector3().copy(part.userData.originalPosition || part.position);
        const offset = direction.multiplyScalar(explodeAmount * 2);
        const newPosition = originalPosition.clone().add(offset);
        
        if (!part.userData.originalPosition) {
            part.userData.originalPosition = originalPosition.clone();
        }
        
        part.position.copy(newPosition);
    });
}

// Function to reset explosion positions
function resetExplosionPositions() {
    rightOriginalPositions.clear();
    const explodeSlider = document.getElementById('explode-slider');
    if (explodeSlider) {
        explodeSlider.value = 0;
    }
    
    // Reset explosion to 0
    applyExplodeEffect(0);
}

// Initialize explosion slider
function initializeExplosionSlider() {
    const explodeSlider = document.getElementById('explode-slider');
    if (explodeSlider) {
        explodeSlider.addEventListener('input', function() {
            const explodeValue = parseFloat(this.value) / 100; 
            console.log('Explode slider value:', explodeValue);
            applyExplodeEffect(explodeValue);
        });
    }
} 