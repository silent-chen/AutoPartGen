# AutoPartGen CSS Organization

This folder contains the organized CSS files for the AutoPartGen mesh viewer application.

## File Structure

```
css/
├── explode-slider.css     # Explosion slider styling
├── comparison-slider.css  # Comparison slider styling
├── mesh-viewer.css        # Mesh viewer and container styling
├── gallery.css            # Gallery and image selection styling
└── README.md              # This file
```

## File Descriptions

### explode-slider.css
- Custom styling for the explosion slider
- Webkit and Mozilla browser compatibility
- Hover effects and transitions
- Thumb styling and track appearance

### comparison-slider.css
- Styling for the comparison slider between left/right meshes
- Drag handle styling and hover effects
- Visual feedback for dragging state
- Hit area expansion for better usability

### mesh-viewer.css
- Container styling for mesh viewers
- Three.js canvas styling
- Background color and overflow handling
- Border and layout styling

### gallery.css
- Image gallery grid layout
- Mesh pair option styling
- Hover effects and selection states
- Responsive gallery container

## Integration

These CSS files are loaded in the HTML `<head>` section:

```html
<link rel="stylesheet" href="css/explode-slider.css">
<link rel="stylesheet" href="css/comparison-slider.css">
<link rel="stylesheet" href="css/mesh-viewer.css">
<link rel="stylesheet" href="css/gallery.css">
```

## Benefits

- **Modular Design**: Each file handles specific UI components
- **Easy Maintenance**: Find and edit styles quickly
- **Better Organization**: Logical separation of styling concerns
- **Cleaner HTML**: Removed inline styles from HTML
- **Reusability**: Styles can be easily reused or modified 