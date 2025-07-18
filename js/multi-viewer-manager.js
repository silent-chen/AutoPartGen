// Multi-Section Viewer Manager
class MeshViewerManager {
    constructor() {
        this.viewers = new Map();
        this.activeViewers = new Map();
    }

    // Initialize all viewers
    initializeAllViewers() {
        const baseUrl = 'https://huggingface.co/datasets/silentchen/AutoPartGen-projectpage-assets/resolve/main';
        
        const sections = [
            {
                id: 'image-to-parts',
                title: 'Image to Parts',
                meshPath: `${baseUrl}/image_to_parts/glbs`,
                imagePath: `${baseUrl}/image_to_parts/images`,
                meshFiles: ['crab', 'bear_dancing', 'dozer', 'cars_2']
            },
            {
                id: 'city-scene',
                title: 'City Scene Generation',
                meshPath: `${baseUrl}/city_scene/glbs`,
                imagePath: `${baseUrl}/city_scene/images`,
                meshFiles: ['mars', 'demo', 'medieval', 'solarpunk'] // Using same files for now
            },
            {
                id: 'object-to-parts',
                title: 'Object to Parts',
                meshPath: `${baseUrl}/object_to_parts/glbs`,
                imagePath: `${baseUrl}/object_to_parts/images`,
                meshFiles: ['BUILD_A_ROBOT', 'GEARS_PUZZLES_STANDARD_gcYxhNHhKlI', 'GRANDMOTHER', 'STACKING_BEAR_V04KKgGBn2A'] // Using same files for now
            },
            {
                id: 'mask-to-parts',
                title: 'Mask to Parts',
                meshPath: `${baseUrl}/mask_to_parts/glbs`,
                imagePath: `${baseUrl}/mask_to_parts/images`,
                meshFiles: ['tree_mask_1', 'tree_mask_2'] 
            },
            {
                id: 'scene-generation',
                title: 'Scene Generation',
                meshPath: `${baseUrl}/scene_generation/glbs`,
                imagePath: `${baseUrl}/scene_generation/images`,
                meshFiles: ['table', 'room', 'castle', 'castle2', 'office', 'office2'] 
            }
        ];

        sections.forEach(section => {
            const sectionElement = document.getElementById(section.id);
            if (sectionElement) {
                this.createViewer(section.id, section);
            }
        });
    }

    // Create a viewer for a specific section
    createViewer(sectionId, config) {
        const viewer = new SectionViewer(sectionId, config);
        this.viewers.set(sectionId, viewer);
        return viewer;
    }

    // Get a specific viewer
    getViewer(sectionId) {
        return this.viewers.get(sectionId);
    }

    // Cleanup all viewers
    cleanup() {
        this.viewers.forEach(viewer => {
            viewer.cleanup();
        });
        this.viewers.clear();
    }
}

// Individual section viewer class
class SectionViewer {
    constructor(sectionId, config) {
        this.sectionId = sectionId;
        this.config = config;
        this.leftScene = null;
        this.rightScene = null;
        this.leftCamera = null;
        this.rightCamera = null;
        this.leftRenderer = null;
        this.rightRenderer = null;
        this.leftModel = null;
        this.rightModel = null;
        this.leftControls = null;
        this.rightControls = null;
        this.currentModelIndex = 0;
        this.rightOriginalPositions = new Map();
        this.cameraSync = true; // Enable camera synchronization
        this.syncingFromLeft = false;
        this.syncingFromRight = false;
        this.progressiveAnimation = null; // For automatic progressive animation
        
        this.init();
    }

    init() {
        this.setupContainers();
        this.initializeLeftViewer();
        this.initializeRightViewer();
        this.setupCameraSync();
        this.setupGallery();
        this.setupControls();
        this.animate();
    }

    setupContainers() {
        // Get the section container
        this.sectionContainer = document.getElementById(this.sectionId);
        if (!this.sectionContainer) {
            console.error(`Section container not found: ${this.sectionId}`);
            return;
        }

        // Get viewer containers - try with section-specific IDs first, then fall back to generic IDs within the section
        this.leftContainer = this.sectionContainer.querySelector(`#${this.sectionId}-left-mesh`) || 
                            this.sectionContainer.querySelector('[id*="left-mesh"]');
        this.rightContainer = this.sectionContainer.querySelector(`#${this.sectionId}-right-mesh`) || 
                             this.sectionContainer.querySelector('[id*="right-mesh"]');
        this.explodeSlider = this.sectionContainer.querySelector(`#${this.sectionId}-explode-slider`) || 
                           this.sectionContainer.querySelector('[id*="explode-slider"]');
        this.comparisonSlider = this.sectionContainer.querySelector(`#${this.sectionId}-comparison-slider`) || 
                              this.sectionContainer.querySelector('[id*="comparison-slider"]');
        this.galleryContainer = this.sectionContainer.querySelector('.image-gallery');

        console.log(`Section ${this.sectionId} containers:`, {
            left: !!this.leftContainer,
            right: !!this.rightContainer,
            explode: !!this.explodeSlider,
            comparison: !!this.comparisonSlider,
            gallery: !!this.galleryContainer
        });
    }

    initializeLeftViewer() {
        if (!this.leftContainer) {
            console.error(`Left container not found for section: ${this.sectionId}`);
            return;
        }

        const width = this.leftContainer.clientWidth;
        const height = this.leftContainer.clientHeight;

        this.leftScene = new THREE.Scene();
        this.leftCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        
        // Set initial camera position based on section
        if (this.sectionId === 'city-scene') {
            this.leftCamera.position.set(3.5, 3.5, 3.5);
        } else {
            this.leftCamera.position.set(0, 1, 5);
        }

        this.leftRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.leftRenderer.setSize(width, height);
        this.leftRenderer.setClearColor(0xffffff, 1);
        this.leftRenderer.outputEncoding = THREE.sRGBEncoding;
        this.leftRenderer.physicallyCorrectLights = true;

        this.leftContainer.appendChild(this.leftRenderer.domElement);

        this.leftControls = new THREE.OrbitControls(this.leftCamera, this.leftRenderer.domElement);
        this.leftControls.enableDamping = true;
        this.leftControls.dampingFactor = 0.25;

        this.addLights(this.leftScene);
    }

    initializeRightViewer() {
        if (!this.rightContainer) {
            console.error(`Right container not found for section: ${this.sectionId}`);
            return;
        }

        const width = this.rightContainer.clientWidth;
        const height = this.rightContainer.clientHeight;

        this.rightScene = new THREE.Scene();
        this.rightCamera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
        
        // Set initial camera position based on section
        if (this.sectionId === 'city-scene') {
            this.rightCamera.position.set(3.5, 3.5, 3.5);
        } else {
            this.rightCamera.position.set(0, 1, 5);
        }

        this.rightRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.rightRenderer.setSize(width, height);
        this.rightRenderer.setClearColor(0xffffff, 1);
        this.rightRenderer.outputEncoding = THREE.sRGBEncoding;
        this.rightRenderer.physicallyCorrectLights = true;

        this.rightContainer.appendChild(this.rightRenderer.domElement);

        this.rightControls = new THREE.OrbitControls(this.rightCamera, this.rightRenderer.domElement);
        this.rightControls.enableDamping = true;
        this.rightControls.dampingFactor = 0.25;

        this.addLights(this.rightScene);
    }

    setupCameraSync() {
        if (!this.leftControls || !this.rightControls) return;

        // Sync from left to right
        this.leftControls.addEventListener('change', () => {
            if (this.cameraSync && !this.syncingFromRight) {
                this.syncingFromLeft = true;
                this.syncCameraFromLeftToRight();
                this.syncingFromLeft = false;
            }
        });

        // Sync from right to left
        this.rightControls.addEventListener('change', () => {
            if (this.cameraSync && !this.syncingFromLeft) {
                this.syncingFromRight = true;
                this.syncCameraFromRightToLeft();
                this.syncingFromRight = false;
            }
        });
    }

    syncCameraFromLeftToRight() {
        if (this.leftCamera && this.rightCamera && this.leftControls && this.rightControls) {
            this.rightCamera.position.copy(this.leftCamera.position);
            this.rightCamera.rotation.copy(this.leftCamera.rotation);
            this.rightControls.target.copy(this.leftControls.target);
            this.rightControls.update();
        }
    }

    syncCameraFromRightToLeft() {
        if (this.leftCamera && this.rightCamera && this.leftControls && this.rightControls) {
            this.leftCamera.position.copy(this.rightCamera.position);
            this.leftCamera.rotation.copy(this.rightCamera.rotation);
            this.leftControls.target.copy(this.rightControls.target);
            this.leftControls.update();
        }
    }

    resetCameraPositions() {
        // Determine camera position based on section
        let cameraPosition;
        if (this.sectionId === 'city-scene') {
            // 45-degree angled view for city scenes
            cameraPosition = { x: 3.5, y: 3.5, z: 3.5 };
        } else {
            // Default front view for other sections
            cameraPosition = { x: 0, y: 1, z: 5 };
        }

        // Reset both cameras to appropriate position
        if (this.leftCamera) {
            this.leftCamera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            this.leftCamera.lookAt(0, 0, 0);
            if (this.leftControls) {
                this.leftControls.target.set(0, 0, 0);
                this.leftControls.update();
            }
        }
        
        if (this.rightCamera) {
            this.rightCamera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z);
            this.rightCamera.lookAt(0, 0, 0);
            if (this.rightControls) {
                this.rightControls.target.set(0, 0, 0);
                this.rightControls.update();
            }
        }
    }

    addLights(scene) {
        const ambientLight = new THREE.AmbientLight(0x404040, 2.4);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 3.0);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1.6);
        directionalLight2.position.set(-1, 0.5, -1);
        scene.add(directionalLight2);

        const topLight = new THREE.DirectionalLight(0xffffff, 1.2);
        topLight.position.set(0, 2, 0);
        scene.add(topLight);

        const bottomLight = new THREE.DirectionalLight(0xffffff, 1.0);
        bottomLight.position.set(0, -2, 0);
        scene.add(bottomLight);
    }

    formatMeshName(meshFile) {
        // Remove file extension if present
        let name = meshFile.replace(/\.(glb|gltf|obj)$/i, '');
        
        // Handle specific naming patterns
        if (name.includes('_')) {
            // Replace underscores with spaces
            name = name.replace(/_/g, ' ');
        }
        
        // Remove random IDs and codes (like 'gcYxhNHhKlI', 'V04KKgGBn2A')
        name = name.replace(/\s+[a-zA-Z0-9]{8,}\s*$/g, '');
        name = name.replace(/\s+(STANDARD|V\d+)\s*[a-zA-Z0-9]*$/g, '');
        
        // Convert to title case
        name = name.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
        
        // Handle special cases for better readability
        const specialCases = {

            'Build A Robot': 'Build A Robot',
            'Gears Puzzles': 'Gears Puzzles',
            'Bear Dancing': 'Bear Dancing',
            'Stacking Bear': 'Stacking Bear',
            'Cars 2': 'Car',
            'Castle2': 'Dragon Castle',
            'Office2': 'Office 2',
            'Castle': 'CLock Castle',
            "Table": "Study Table",
            "Demo": "Cozy Town",
            "Tree Mask 1": "Tree Mask 1",
            "Tree Mask 2": "Tree Mask 2"
        };
        
        // Apply special cases
        for (const [key, value] of Object.entries(specialCases)) {
            if (name === key) {
                name = value;
                break;
            }
        }
        
        // Limit length for display
        if (name.length > 15) {
            name = name.substring(0, 12) + '...';
        }
        
        return name;
    }

    setupGallery() {
        if (!this.galleryContainer) {
            console.error(`Gallery container not found for section: ${this.sectionId}`);
            return;
        }

        // Clear existing gallery
        this.galleryContainer.innerHTML = '';

        // Gallery configuration
        this.itemsPerPage = 4;
        this.currentPage = 0;
        this.totalPages = Math.ceil(this.config.meshFiles.length / this.itemsPerPage);
        this.galleryItems = [];

        // Setup gallery container styling
        this.galleryContainer.style.display = 'flex';
        this.galleryContainer.style.justifyContent = 'center';
        this.galleryContainer.style.alignItems = 'center';
        this.galleryContainer.style.gap = '1rem';
        this.galleryContainer.style.minHeight = '150px';
        this.galleryContainer.style.padding = '1rem';

        // Create all gallery items
        this.config.meshFiles.forEach((meshFile, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'mesh-pair-option';
            galleryItem.style.width = '150px';
            galleryItem.style.height = '150px'; // Increased height to accommodate text
            galleryItem.style.cursor = 'pointer';
            galleryItem.style.transition = 'transform 0.3s';
            galleryItem.style.display = 'none'; // Initially hidden
            galleryItem.style.textAlign = 'center';
            galleryItem.dataset.index = index;

            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.style.width = '100%';
            imageContainer.style.height = '120px'; // Fixed height for image
            imageContainer.style.marginBottom = '5px';

            const img = document.createElement('img');
            img.src = `${this.config.imagePath}/${meshFile}.png`;
            img.alt = meshFile;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';
            img.style.borderRadius = '8px';
            img.style.border = '3px solid #ddd';
            img.style.transition = 'all 0.3s';

            // Handle image load errors - fallback to image_to_parts directory
            img.onerror = () => {
                const fallbackUrl = 'https://huggingface.co/datasets/silentchen/AutoPartGen-projectpage-assets/resolve/main/image_to_parts/images';
                img.src = `${fallbackUrl}/${meshFile}.png`;
                img.onerror = () => {
                    img.style.display = 'none';
                };
            };

            imageContainer.appendChild(img);

            // Create text label
            const textLabel = document.createElement('div');
            textLabel.style.fontSize = '12px';
            textLabel.style.fontWeight = '500';
            textLabel.style.color = '#333';
            textLabel.style.lineHeight = '1.2';
            textLabel.style.wordWrap = 'break-word';
            textLabel.style.height = '25px'; // Fixed height for text
            textLabel.style.display = 'flex';
            textLabel.style.alignItems = 'center';
            textLabel.style.justifyContent = 'center';
            textLabel.style.transition = 'color 0.3s';
            
            // Format the mesh file name for display
            const displayText = this.formatMeshName(meshFile);
            textLabel.textContent = displayText;

            galleryItem.appendChild(imageContainer);
            galleryItem.appendChild(textLabel);
            this.galleryContainer.appendChild(galleryItem);
            this.galleryItems.push(galleryItem);

            // Add click event
            galleryItem.addEventListener('click', () => {
                this.loadMesh(meshFile, index);
                this.updateGallerySelection(index);
            });

            // Add hover effects
            galleryItem.addEventListener('mouseenter', () => {
                galleryItem.style.transform = 'scale(1.1)';
                img.style.borderColor = '#3498db';
                textLabel.style.color = '#3498db';
            });

            galleryItem.addEventListener('mouseleave', () => {
                if (this.currentModelIndex !== index) {
                    galleryItem.style.transform = 'scale(1)';
                    img.style.borderColor = '#ddd';
                    textLabel.style.color = '#333';
                }
            });
        });

        // Create navigation
        this.createGalleryNavigation();

        // Show first page
        this.showPage(0);

        // Load first mesh by default
        if (this.config.meshFiles.length > 0) {
            this.loadMesh(this.config.meshFiles[0], 0);
        }
    }

    createGalleryNavigation() {
        const galleryParent = this.galleryContainer.parentElement;
        
        // Remove existing navigation
        const existingNav = galleryParent.querySelector('.gallery-navigation-bottom');
        if (existingNav) existingNav.remove();

        // Only create navigation if we have more than one page
        if (this.totalPages <= 1) {
            return;
        }

        // Create bottom navigation container
        const navBottom = document.createElement('div');
        navBottom.className = 'gallery-navigation-bottom';

        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'gallery-nav-button';
        prevButton.innerHTML = '←';
        prevButton.title = 'Previous page';
        prevButton.addEventListener('click', () => this.previousPage());

        // Create page indicators
        const pageIndicators = document.createElement('div');
        pageIndicators.className = 'page-indicators';

        for (let i = 0; i < this.totalPages; i++) {
            const dot = document.createElement('div');
            dot.className = 'page-dot';
            if (i === 0) dot.classList.add('active');
            dot.title = `Go to page ${i + 1}`;
            dot.addEventListener('click', () => this.showPage(i));
            pageIndicators.appendChild(dot);
        }

        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'gallery-nav-button';
        nextButton.innerHTML = '→';
        nextButton.title = 'Next page';
        nextButton.addEventListener('click', () => this.nextPage());

        // Assemble the navigation
        navBottom.appendChild(prevButton);
        navBottom.appendChild(pageIndicators);
        navBottom.appendChild(nextButton);

        galleryParent.appendChild(navBottom);

        // Store references
        this.prevButton = prevButton;
        this.nextButton = nextButton;
        this.pageIndicators = pageIndicators;
    }

    showPage(pageIndex) {
        if (pageIndex < 0 || pageIndex >= this.totalPages) return;

        this.currentPage = pageIndex;

        // Hide all items
        this.galleryItems.forEach(item => {
            item.style.display = 'none';
        });

        // Show items for current page
        const startIndex = pageIndex * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.galleryItems.length);

        for (let i = startIndex; i < endIndex; i++) {
            this.galleryItems[i].style.display = 'block';
        }

        // Update navigation buttons
        if (this.prevButton) this.prevButton.disabled = pageIndex === 0;
        if (this.nextButton) this.nextButton.disabled = pageIndex === this.totalPages - 1;

        // Update page indicators
        if (this.pageIndicators) {
            const dots = this.pageIndicators.querySelectorAll('.page-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === pageIndex);
            });
        }
    }

    previousPage() {
        if (this.currentPage > 0) {
            this.showPage(this.currentPage - 1);
        }
    }

    nextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.showPage(this.currentPage + 1);
        }
    }

    setupControls() {
        if (this.explodeSlider) {
            this.explodeSlider.addEventListener('input', (e) => {
                const explodeValue = parseFloat(e.target.value) / 100;
                this.applyExplodeEffect(explodeValue);
            });
        }

        // Setup percentage slider
        const percentageSlider = this.sectionContainer.querySelector(`#${this.sectionId}-percentage-slider`) || 
                                this.sectionContainer.querySelector('[id*="percentage-slider"]');
        if (percentageSlider) {
            percentageSlider.addEventListener('input', (e) => {
                // Stop automatic animation if user manually adjusts slider
                if (this.progressiveAnimation) {
                    clearInterval(this.progressiveAnimation);
                    this.progressiveAnimation = null;
                }
                
                const percentageValue = parseFloat(e.target.value) / 100;
                this.applyPercentageEffect(percentageValue);
            });
        }

        if (this.comparisonSlider) {
            this.setupComparisonSlider();
        }
    }

    setupComparisonSlider() {
        let isDragging = false;
        const comparisonContainer = this.comparisonSlider.parentElement;

        const updateComparison = (percentage) => {
            const leftContainer = this.sectionContainer.querySelector('[id*="left-container"]');
            const rightContainer = this.sectionContainer.querySelector('[id*="right-container"]');
            
            if (leftContainer && rightContainer) {
                leftContainer.style.width = percentage + '%';
                rightContainer.style.width = (100 - percentage) + '%';
                this.comparisonSlider.style.left = percentage + '%';
                
                // Resize renderers
                setTimeout(() => {
                    this.resizeRenderers();
                }, 10);
            }
        };

        this.comparisonSlider.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            const rect = comparisonContainer.getBoundingClientRect();
            const percentage = Math.max(0, Math.min(100, 
                ((e.clientX - rect.left) / rect.width) * 100));
            
            updateComparison(percentage);
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });
    }

    loadMesh(meshFile, index) {
        this.currentModelIndex = index;
        
        // Stop any existing progressive animation
        if (this.progressiveAnimation) {
            clearInterval(this.progressiveAnimation);
            this.progressiveAnimation = null;
        }
        
        // Remove existing models
        if (this.leftModel) {
            this.leftScene.remove(this.leftModel);
            this.leftModel = null;
        }
        if (this.rightModel) {
            this.rightScene.remove(this.rightModel);
            this.rightModel = null;
        }

        // Reset cameras when loading new mesh
        this.resetCameraPositions();

        // Determine scale based on section
        const scale = this.sectionId === 'city-scene' ? 0.3 : 1.0;

        const loader = new THREE.GLTFLoader();
        
        // Load left mesh (combined)
        loader.load(
            `${this.config.meshPath}/${meshFile}.glb`,
            (gltf) => {
                this.leftModel = gltf.scene.clone();
                this.leftModel.scale.set(scale, scale, scale);
                this.leftScene.add(this.leftModel);
                this.changeModelColor(this.leftModel, 0xffffff);
            },
            undefined,
            (error) => {
                console.warn(`Error loading left mesh: ${meshFile} from ${this.config.meshPath}, trying fallback`);
                // Fallback to image_to_parts directory on Hugging Face
                const fallbackUrl = 'https://huggingface.co/datasets/silentchen/AutoPartGen-projectpage-assets/resolve/main/image_to_parts/glbs';
                loader.load(
                    `${fallbackUrl}/${meshFile}.glb`,
                    (gltf) => {
                        this.leftModel = gltf.scene.clone();
                        this.leftModel.scale.set(scale, scale, scale);
                        this.leftScene.add(this.leftModel);
                        this.changeModelColor(this.leftModel, 0xffffff);
                    },
                    undefined,
                    (error) => console.error(`Error loading left mesh fallback: ${meshFile}`, error)
                );
            }
        );

        // Load right mesh (exploded)
        loader.load(
            `${this.config.meshPath}/${meshFile}.glb`,
            (gltf) => {
                this.rightModel = gltf.scene.clone();
                this.rightModel.scale.set(scale, scale, scale);
                this.rightScene.add(this.rightModel);
                this.changeModelColor(this.rightModel, 0xffffff);
                
                // Reset explosion and start progressive animation
                this.resetExplosion();
                this.resetPercentage();
            },
            undefined,
            (error) => {
                console.warn(`Error loading right mesh: ${meshFile} from ${this.config.meshPath}, trying fallback`);
                // Fallback to image_to_parts directory on Hugging Face
                const fallbackUrl = 'https://huggingface.co/datasets/silentchen/AutoPartGen-projectpage-assets/resolve/main/image_to_parts/glbs';
                loader.load(
                    `${fallbackUrl}/${meshFile}.glb`,
                    (gltf) => {
                        this.rightModel = gltf.scene.clone();
                        this.rightModel.scale.set(scale, scale, scale);
                        this.rightScene.add(this.rightModel);
                        this.changeModelColor(this.rightModel, 0xffffff);
                        
                        // Reset explosion and start progressive animation
                        this.resetExplosion();
                        this.resetPercentage();
                    },
                    undefined,
                    (error) => console.error(`Error loading right mesh fallback: ${meshFile}`, error)
                );
            }
        );
    }

    changeModelColor(model, color) {
        if (model) {
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material.color.set(color);
                }
            });
        }
    }

    updateGallerySelection(index) {
        this.currentModelIndex = index;
        
        // Calculate which page the selected item is on
        const targetPage = Math.floor(index / this.itemsPerPage);
        
        // Navigate to the page containing the selected item if not already there
        if (targetPage !== this.currentPage) {
            this.showPage(targetPage);
        }
        
        // Update visual selection
        this.galleryItems.forEach((item, i) => {
            const img = item.querySelector('img');
            const textLabel = item.querySelector('div:last-child'); // Get the text label
            
            if (i === index) {
                item.style.transform = 'scale(1.1)';
                img.style.borderColor = '#3498db';
                if (textLabel) textLabel.style.color = '#3498db';
                item.classList.add('selected');
            } else {
                item.style.transform = 'scale(1)';
                img.style.borderColor = '#ddd';
                if (textLabel) textLabel.style.color = '#333';
                item.classList.remove('selected');
            }
        });
    }

    applyExplodeEffect(explodeAmount) {
        if (!this.rightModel) return;

        const root = this.rightModel.children[0];
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

    applyPercentageEffect(percentage) {
        // Apply to both left and right models
        this.applyPercentageToModel(this.leftModel, percentage);
        this.applyPercentageToModel(this.rightModel, percentage);
    }

    applyPercentageToModel(model, percentage) {
        if (!model) return;

        const root = model.children[0];
        if (!root || !root.children) return;

        // Create array of parts with their names and sort them
        const partsWithNames = root.children.map((part, originalIndex) => ({
            part: part,
            name: part.name || `part_${originalIndex}`,
            originalIndex: originalIndex
        }));

        // Sort parts by number extracted from name
        partsWithNames.sort((a, b) => {
            const extractNumber = (name) => {
                // Extract number from name (e.g., "geometry 10" -> 10, "geometry 0.008" -> 0.008)
                const match = name.match(/\d+(\.\d+)?/)?.[0];
                if (!match) return 0;
                
                // Check if number has leading zeros (e.g., "000008")
                if (match.match(/^0+\d+$/)) {
                    // Remove leading zeros and treat as decimal (e.g., "000008" -> "8" -> 0.8)
                    const withoutLeadingZeros = match.replace(/^0+/, '');
                    return parseFloat('0.' + withoutLeadingZeros);
                }
                
                return parseFloat(match);
            };
            
            const numberA = extractNumber(a.name);
            const numberB = extractNumber(b.name);
            return numberA - numberB;
        });

        const totalParts = partsWithNames.length;
        const visibleParts = Math.ceil(totalParts * percentage);

        // Print parts information (only when percentage changes, not just on load)
        // if (percentage !== this.lastLoggedPercentage) {
        //     console.log(`\n=== Parts Information (${this.sectionId}) ===`);
        //     console.log(`Total parts: ${totalParts}`);
        //     console.log(`Visible parts: ${visibleParts} (${Math.round(percentage * 100)}%)`);
        //     console.log(`Part names (sorted):`, partsWithNames.map(item => item.name));
        //     console.log(`Currently visible parts:`, partsWithNames.slice(0, visibleParts).map(item => item.name));
        //     this.lastLoggedPercentage = percentage;
        // }

        // Apply visibility based on sorted order
        partsWithNames.forEach((item, sortedIndex) => {
            const part = item.part;
            
            if (sortedIndex < visibleParts) {
                // Show this part
                part.visible = true;
                part.traverse((child) => {
                    if (child.isMesh) {
                        child.visible = true;
                    }
                });
            } else {
                // Hide this part
                part.visible = false;
                part.traverse((child) => {
                    if (child.isMesh) {
                        child.visible = false;
                    }
                });
            }
        });
    }

    resetExplosion() {
        if (this.explodeSlider) {
            this.explodeSlider.value = 0;
        }
        this.applyExplodeEffect(0);
    }

    resetPercentage() {
        const percentageSlider = this.sectionContainer.querySelector(`#${this.sectionId}-percentage-slider`) || 
                                this.sectionContainer.querySelector('[id*="percentage-slider"]');
        if (percentageSlider) {
            percentageSlider.value = 0;
        }
        
        // Start the automatic progressive animation
        this.startProgressiveAnimation();
    }

    startProgressiveAnimation() {
        // Stop any existing animation
        if (this.progressiveAnimation) {
            clearInterval(this.progressiveAnimation);
        }

        let currentPercentage = 0;
        let pauseFrames = 0; // Counter for pause frames at 100%
        const animationDuration = 3000; // 3 seconds to go from 0% to 100%
        const pauseDuration = 1000; // 1 second pause at 100% before resetting
        const frameRate = 60; // 60 fps
        const totalFrames = (animationDuration / 1000) * frameRate;
        const pauseFramesCount = (pauseDuration / 1000) * frameRate;
        const incrementPerFrame = 100 / totalFrames;

        const percentageSlider = this.sectionContainer.querySelector(`#${this.sectionId}-percentage-slider`) || 
                                this.sectionContainer.querySelector('[id*="percentage-slider"]');

        this.progressiveAnimation = setInterval(() => {
            // Handle pause at 100% before resetting
            if (pauseFrames > 0) {
                pauseFrames--;
                if (pauseFrames === 0) {
                    // Reset to 0% after pause
                    currentPercentage = 0;
                }
                return; // Don't update percentage during pause
            }

            currentPercentage += incrementPerFrame;
            
            if (currentPercentage >= 100) {
                currentPercentage = 100;
                pauseFrames = pauseFramesCount; // Add pause at 100%
            }

            // Update slider and apply effect
            if (percentageSlider) {
                percentageSlider.value = currentPercentage;
            }
            this.applyPercentageEffect(currentPercentage / 100);
        }, 1000 / frameRate);
    }

    resizeRenderers() {
        if (this.leftRenderer && this.leftCamera && this.leftContainer) {
            const width = this.leftContainer.clientWidth;
            const height = this.leftContainer.clientHeight;
            if (width > 0 && height > 0) {
                this.leftRenderer.setSize(width, height);
                this.leftCamera.aspect = width / height;
                this.leftCamera.updateProjectionMatrix();
            }
        }

        if (this.rightRenderer && this.rightCamera && this.rightContainer) {
            const width = this.rightContainer.clientWidth;
            const height = this.rightContainer.clientHeight;
            if (width > 0 && height > 0) {
                this.rightRenderer.setSize(width, height);
                this.rightCamera.aspect = width / height;
                this.rightCamera.updateProjectionMatrix();
            }
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        if (this.leftControls) this.leftControls.update();
        if (this.rightControls) this.rightControls.update();

        if (this.leftRenderer && this.leftScene && this.leftCamera) {
            this.leftRenderer.render(this.leftScene, this.leftCamera);
        }
        if (this.rightRenderer && this.rightScene && this.rightCamera) {
            this.rightRenderer.render(this.rightScene, this.rightCamera);
        }
    }

    cleanup() {
        if (this.leftRenderer) {
            this.leftRenderer.dispose();
        }
        if (this.rightRenderer) {
            this.rightRenderer.dispose();
        }
        // Additional cleanup...
    }
}

// Global manager instance
const meshViewerManager = new MeshViewerManager();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    meshViewerManager.initializeAllViewers();
}); 