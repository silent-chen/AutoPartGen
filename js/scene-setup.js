// Three.js Scene Setup and Initialization

// Global variables for scenes
let leftScene, leftCamera, leftRenderer, leftModel, leftControls;
let rightScene, rightCamera, rightRenderer, rightModel, rightControls;
let rightOriginalPositions = new Map();

function initializeLeftViewer() {
    const container = document.getElementById('left-mesh');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create Three.js scene for left mesh
    leftScene = new THREE.Scene();
    leftCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    leftCamera.position.set(0, 1, 5);
    
    leftRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    leftRenderer.setSize(width, height);
    leftRenderer.setClearColor(0xffffff, 1);
    leftRenderer.outputEncoding = THREE.sRGBEncoding;
    leftRenderer.physicallyCorrectLights = true;
    
    // Make sure canvas fills the container
    leftRenderer.domElement.style.width = '100%';
    leftRenderer.domElement.style.height = '100%';
    leftRenderer.domElement.style.display = 'block';
    leftRenderer.domElement.style.backgroundColor = 'white';
    
    container.appendChild(leftRenderer.domElement);
    
    // Add bright lights - multiple sources for better illumination (2x stronger)
    const ambientLight = new THREE.AmbientLight(0x404040, 2.4);
    leftScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
    directionalLight.position.set(1, 1, 1);
    leftScene.add(directionalLight);
    
    // Add second directional light for better illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.6);
    directionalLight2.position.set(-1, 0.5, -1);
    leftScene.add(directionalLight2);
    
    // Add third light from top for even better illumination
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 2, 0);
    leftScene.add(topLight);
    
    // Add additional lights for maximum brightness
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.4);
    frontLight.position.set(0, 0, 2);
    leftScene.add(frontLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(0, 0, -2);
    leftScene.add(backLight);
    
    const leftSideLight = new THREE.DirectionalLight(0xffffff, 1.2);
    leftSideLight.position.set(-2, 0, 0);
    leftScene.add(leftSideLight);
    
    const rightSideLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rightSideLight.position.set(2, 0, 0);
    leftScene.add(rightSideLight);
    
    // Add hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.6);
    hemisphereLight.position.set(0, 5, 0);
    leftScene.add(hemisphereLight);
    
    // Add point lights for highlights
    const pointLight1 = new THREE.PointLight(0xffffff, 1.6, 10);
    pointLight1.position.set(3, 3, 3);
    leftScene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight2.position.set(-3, 2, -3);
    leftScene.add(pointLight2);
    
    // Add bottom light
    const bottomLight = new THREE.DirectionalLight(0xffffff, 3.0);
    bottomLight.position.set(0, -2, 0);
    leftScene.add(bottomLight);
    
    // Add orbit controls
    leftControls = new THREE.OrbitControls(leftCamera, leftRenderer.domElement);
    leftControls.enableDamping = true;
    leftControls.dampingFactor = 0.05;
    
    // Add event listeners for camera synchronization
    leftControls.addEventListener('change', function() {
        if (rightControls && !rightControls.isUpdating) {
            rightControls.isUpdating = true;
            syncCameraFromLeftToRight();
            rightControls.isUpdating = false;
        }
    });
}

function initializeRightViewer() {
    const container = document.getElementById('right-mesh');
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create Three.js scene for right mesh (explosion viewer)
    rightScene = new THREE.Scene();
    rightCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    rightCamera.position.set(0, 1, 5);
    
    rightRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    rightRenderer.setSize(width, height);
    rightRenderer.setClearColor(0xffffff, 1);
    rightRenderer.outputEncoding = THREE.sRGBEncoding;
    rightRenderer.physicallyCorrectLights = true;
    
    // Make sure canvas fills the container
    rightRenderer.domElement.style.width = '100%';
    rightRenderer.domElement.style.height = '100%';
    rightRenderer.domElement.style.display = 'block';
    rightRenderer.domElement.style.backgroundColor = 'white';
    
    container.appendChild(rightRenderer.domElement);
    
    // Add bright lights - multiple sources for better illumination (2x stronger)
    const ambientLight = new THREE.AmbientLight(0x404040, 2.4);
    rightScene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
    directionalLight.position.set(1, 1, 1);
    rightScene.add(directionalLight);
    
    // Add second directional light for better illumination
    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.6);
    directionalLight2.position.set(-1, 0.5, -1);
    rightScene.add(directionalLight2);
    
    // Add third light from top for even better illumination
    const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
    topLight.position.set(0, 2, 0);
    rightScene.add(topLight);
    
    // Add additional lights for maximum brightness
    const frontLight = new THREE.DirectionalLight(0xffffff, 1.4);
    frontLight.position.set(0, 0, 2);
    rightScene.add(frontLight);
    
    const backLight = new THREE.DirectionalLight(0xffffff, 1.0);
    backLight.position.set(0, 0, -2);
    rightScene.add(backLight);
    
    const leftSideLight = new THREE.DirectionalLight(0xffffff, 1.2);
    leftSideLight.position.set(-2, 0, 0);
    rightScene.add(leftSideLight);
    
    const rightSideLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rightSideLight.position.set(2, 0, 0);
    rightScene.add(rightSideLight);
    
    // Add hemisphere light for natural sky/ground lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.6);
    hemisphereLight.position.set(0, 5, 0);
    rightScene.add(hemisphereLight);
    
    // Add point lights for highlights
    const pointLight1 = new THREE.PointLight(0xffffff, 1.6, 10);
    pointLight1.position.set(3, 3, 3);
    rightScene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight2.position.set(-3, 2, -3);
    rightScene.add(pointLight2);
    
    // Add bottom light
    const bottomLight = new THREE.DirectionalLight(0xffffff, 3.0);
    bottomLight.position.set(0, -2, 0);
    rightScene.add(bottomLight);
    
    // Add orbit controls
    rightControls = new THREE.OrbitControls(rightCamera, rightRenderer.domElement);
    rightControls.enableDamping = true;
    rightControls.dampingFactor = 0.05;
    
    // Add event listeners for camera synchronization
    rightControls.addEventListener('change', function() {
        if (leftControls && !leftControls.isUpdating) {
            leftControls.isUpdating = true;
            syncCameraFromRightToLeft();
            leftControls.isUpdating = false;
        }
    });
    
    // Start animation loop
    animate();
}

function animate() {
    requestAnimationFrame(animate);
    
    if (leftControls) leftControls.update();
    if (leftRenderer && leftScene && leftCamera) {
        leftRenderer.render(leftScene, leftCamera);
    }
    
    if (rightControls) rightControls.update();
    if (rightRenderer && rightScene && rightCamera) {
        rightRenderer.render(rightScene, rightCamera);
    }
}

// Handle window resize for both Three.js viewers
window.addEventListener('resize', () => {
    // Handle left viewer resize
    if (leftRenderer && leftCamera) {
        const leftContainer = document.getElementById('left-mesh');
        const leftWidth = leftContainer.clientWidth;
        const leftHeight = leftContainer.clientHeight;
        
        leftRenderer.setSize(leftWidth, leftHeight);
        leftCamera.aspect = leftWidth / leftHeight;
        leftCamera.updateProjectionMatrix();
    }
    
    // Handle right viewer resize
    if (rightRenderer && rightCamera) {
        const rightContainer = document.getElementById('right-mesh');
        const rightWidth = rightContainer.clientWidth;
        const rightHeight = rightContainer.clientHeight;
        
        rightRenderer.setSize(rightWidth, rightHeight);
        rightCamera.aspect = rightWidth / rightHeight;
        rightCamera.updateProjectionMatrix();
    }
}); 