// Gallery Selection Functions

function resetPositions() {
    resetExplosionPositions();
    resetCameraPositions();
    
    // Reset comparison slider to center
    updateComparison(50);
}

function initializeGallerySelection() {
    const meshPairOptions = document.querySelectorAll('.mesh-pair-option');
    const leftContainer = document.getElementById('left-container');
    const rightContainer = document.getElementById('right-container');
    
    meshPairOptions.forEach(option => {
        option.addEventListener('click', function(e) {
            const leftMeshPath = this.dataset.leftMesh;
            const rightMeshPath = this.dataset.rightMesh;
            const leftTitle = this.dataset.leftTitle;
            const rightTitle = this.dataset.rightTitle;
            
            // Remove previous selection highlights
            meshPairOptions.forEach(opt => {
                opt.style.transform = 'scale(1)';
                opt.querySelector('img').style.borderColor = '#ddd';
                opt.classList.remove('selected');
            });
            
            // Highlight selected option
            this.style.transform = 'scale(1)';
            this.querySelector('img').style.borderColor = '#3498db';
            this.classList.add('selected');
            
            // Reset positions and slider when loading new models
            resetPositions();
            
            // Load both meshes using Three.js
            loadLeftModel(leftMeshPath);
            loadRightModel(rightMeshPath);
            
            // Update mesh titles
            const leftTitleElement = leftContainer.querySelector('.title');
            const rightTitleElement = rightContainer.querySelector('.title');
            leftTitleElement.textContent = `Combined`;
            rightTitleElement.textContent = `Exploded`;
            
            console.log('Loading models:', { left: leftMeshPath, right: rightMeshPath });
        });
        
        // Add hover effect
        option.addEventListener('mouseenter', function() {
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1.15)';
                this.querySelector('img').style.borderColor = '#3498db';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            // Only remove hover effect if not selected
            if (!this.classList.contains('selected')) {
                this.style.transform = 'scale(1)';
                this.querySelector('img').style.borderColor = '#ddd';
            }
        });
    });
    
    // Initialize with first mesh pair
    if (meshPairOptions.length > 0) {
        meshPairOptions[0].click();
    }
} 