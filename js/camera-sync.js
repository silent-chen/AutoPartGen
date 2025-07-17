// Camera Synchronization Functions

// Camera synchronization functions
function syncCameraFromLeftToRight() {
    if (leftCamera && rightCamera && leftControls && rightControls) {
        rightCamera.position.copy(leftCamera.position);
        rightCamera.rotation.copy(leftCamera.rotation);
        rightControls.target.copy(leftControls.target);
        rightControls.update();
    }
}

function syncCameraFromRightToLeft() {
    if (leftCamera && rightCamera && leftControls && rightControls) {
        leftCamera.position.copy(rightCamera.position);
        leftCamera.rotation.copy(rightCamera.rotation);
        leftControls.target.copy(rightControls.target);
        leftControls.update();
    }
}

// Function to reset positions when new models are loaded
function resetCameraPositions() {
    // Reset both cameras to default position
    if (leftCamera) {
        leftCamera.position.set(0, 1, 5);
        leftCamera.lookAt(0, 0, 0);
        if (leftControls) {
            leftControls.target.set(0, 0, 0);
            leftControls.update();
        }
    }
    
    if (rightCamera) {
        rightCamera.position.set(0, 1, 5);
        rightCamera.lookAt(0, 0, 0);
        if (rightControls) {
            rightControls.target.set(0, 0, 0);
            rightControls.update();
        }
    }
} 