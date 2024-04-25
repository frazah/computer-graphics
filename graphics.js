// Initialize WebGL context and setup scene
function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Setup
    setupGraphics(gl);
    
    // Start rendering loop
    requestAnimationFrame(() => renderLoop(gl));
}

// Main rendering loop
function renderLoop(gl) {
    // Resize canvas to fill window if necessary
    resizeCanvas();

    // Render scene
    // ...
    
    // Update animation and interactions
    // ...

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);

    // compute 3 vertices for 1 triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);


    // Request next frame
    requestAnimationFrame(() => renderLoop(gl));
}

// Entry point
window.onload = initWebGL;
