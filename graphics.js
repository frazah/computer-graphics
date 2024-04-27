// Initialize WebGL context and setup scene
function initWebGL() {
    const canvas = document.getElementById('webgl-canvas');
    const gl = canvas.getContext('webgl2');

    if (!gl) {
        console.error('WebGL not supported');
        return;
    }

    // Setup
    var program = setupGraphics(gl);
    var colorLocation = gl.getUniformLocation(program, "u_color");

    // Setup GUI
    setupGUI();

    // Start rendering loop
    requestAnimationFrame(() => renderLoop(gl, colorLocation));
}


// Main rendering loop
function renderLoop(gl, colorLocation) {
    // Resize canvas to fill window if necessary
    resizeCanvas();
    //webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    //gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


    // Render scene
    // ...

    // Update animation and interactions
    // ...

    // Clear the canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    
    gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 3;
    gl.drawArrays(primitiveType, offset, count);




    // Request next frame
    requestAnimationFrame(() => renderLoop(gl));
}

// Entry point
window.onload = initWebGL;
