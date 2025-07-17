# AutoPartGen JavaScript Organization

This folder contains the organized JavaScript code for the AutoPartGen mesh viewer application.

## File Structure

```
js/
├── main.js              # Main application initialization
├── scene-setup.js       # Three.js scene setup and lighting
├── camera-sync.js       # Camera synchronization between left/right viewers
├── mesh-loader.js       # GLTF model loading functions
├── explosion-effect.js  # Explosion effect implementation
├── comparison-slider.js # Comparison slider functionality
├── gallery-selection.js # Image gallery selection handling
└── README.md           # This file
```

## File Dependencies

The files should be loaded in this order (already configured in `index.html`):

1. `scene-setup.js` - Core Three.js setup and global variables
2. `camera-sync.js` - Camera synchronization functions
3. `mesh-loader.js` - Model loading functions
4. `explosion-effect.js` - Explosion effects
5. `comparison-slider.js` - Comparison slider controls
6. `gallery-selection.js` - Gallery interaction
7. `main.js` - Application initialization

## Key Features

- **Modular Architecture**: Each file handles a specific functionality
- **Global Variables**: Scene variables are defined in `scene-setup.js`
- **Event-Driven**: Uses event listeners for user interactions
- **Responsive**: Handles window resizing and mobile touch
- **Synchronized**: Left and right cameras stay in sync

## Usage

The application automatically initializes when the DOM is loaded. All functionality is self-contained and requires no manual setup.

## Development

To modify functionality:
- Edit the appropriate file based on the feature you want to change
- Global variables and scenes are accessible from all files
- Functions are organized by purpose for easy maintenance 