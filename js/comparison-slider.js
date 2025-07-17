// Comparison Slider Functions

let isDragging = false;

function updateComparison(percentage, animated = false) {
    const leftContainer = document.getElementById('left-container');
    const rightContainer = document.getElementById('right-container');
    const comparisonSlider = document.getElementById('comparison-slider');
    
    // Clamp percentage between 0 and 100
    percentage = Math.max(0, Math.min(100, percentage));
    
    // Add smooth animation for click-to-move
    if (animated) {
        leftContainer.style.transition = 'width 0.3s ease';
        rightContainer.style.transition = 'width 0.3s ease';
        comparisonSlider.style.transition = 'left 0.3s ease';
    } else {
        leftContainer.style.transition = '';
        rightContainer.style.transition = '';
        comparisonSlider.style.transition = '';
    }
    
    // Update container widths
    leftContainer.style.width = percentage + '%';
    rightContainer.style.width = (100 - percentage) + '%';
    
    // Update slider position
    comparisonSlider.style.left = percentage + '%';
    
    // Resize Three.js renderers to match new container sizes
    setTimeout(() => {
        if (leftRenderer && leftCamera) {
            const leftContainer = document.getElementById('left-mesh');
            const leftWidth = leftContainer.clientWidth;
            const leftHeight = leftContainer.clientHeight;
            
            if (leftWidth > 0 && leftHeight > 0) {
                leftRenderer.setSize(leftWidth, leftHeight);
                leftCamera.aspect = leftWidth / leftHeight;
                leftCamera.updateProjectionMatrix();
            }
        }
        
        if (rightRenderer && rightCamera) {
            const rightContainer = document.getElementById('right-mesh');
            const rightWidth = rightContainer.clientWidth;
            const rightHeight = rightContainer.clientHeight;
            
            if (rightWidth > 0 && rightHeight > 0) {
                rightRenderer.setSize(rightWidth, rightHeight);
                rightCamera.aspect = rightWidth / rightHeight;
                rightCamera.updateProjectionMatrix();
            }
        }
    }, animated ? 320 : 10);
    
    // Remove transitions after animation
    if (animated) {
        setTimeout(() => {
            leftContainer.style.transition = '';
            rightContainer.style.transition = '';
            comparisonSlider.style.transition = '';
        }, 300);
    }
}

function startDrag(e) {
    isDragging = true;
    e.preventDefault();
    
    // Add visual feedback
    const comparisonSlider = document.getElementById('comparison-slider');
    comparisonSlider.classList.add('dragging');
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    
    document.addEventListener('mousemove', handleDrag);
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchmove', handleDrag, { passive: false });
    document.addEventListener('touchend', stopDrag);
}

function handleDrag(e) {
    if (!isDragging) return;
    
    e.preventDefault(); // Prevent scrolling on mobile
    
    const comparisonContainer = document.querySelector('.comparison-container');
    const rect = comparisonContainer.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    updateComparison(percentage);
}

function stopDrag() {
    isDragging = false;
    
    // Remove visual feedback
    const comparisonSlider = document.getElementById('comparison-slider');
    comparisonSlider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    
    document.removeEventListener('mousemove', handleDrag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchmove', handleDrag);
    document.removeEventListener('touchend', stopDrag);
}

function initializeComparisonSlider() {
    const comparisonSlider = document.getElementById('comparison-slider');
    
    // Add event listeners for comparison slider
    comparisonSlider.addEventListener('mousedown', startDrag);
    comparisonSlider.addEventListener('touchstart', startDrag, { passive: false });
    
    // Initialize with centered position
    updateComparison(50);
} 