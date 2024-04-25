// Initialize WebGL context and setup scene
function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }
    
    // Start rendering loop
    requestAnimationFrame(() => renderLoop(gl));
}

// Main rendering loop
function renderLoop(gl) {
    // Render scene
    // ...
    
    // Update animation and interactions
    // ...

    // Set clear color to black, fully opaque
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Request next frame
    requestAnimationFrame(() => renderLoop(gl));
}

// Entry point
window.onload = initWebGL;
