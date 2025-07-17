// Main Application Initialization

document.addEventListener('DOMContentLoaded', function() {
    console.log('AutoPartGen Mesh Viewer initializing...');
    
    // Initialize Three.js viewers
    initializeLeftViewer();
    initializeRightViewer();
    
    // Initialize components
    initializeComparisonSlider();
    initializeExplosionSlider();
    initializeGallerySelection();
    
    // Load default models
    loadDefaultModels();
    
    console.log('AutoPartGen Mesh Viewer initialized successfully!');
}); 