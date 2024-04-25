function resizeCanvas() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight / 2;

}

function setupGraphics(gl) {
    // Setup Vertex Shader
    const vertexShaderSource = `
        attribute vec4 position;
        void main() {
            gl_Position = position;
        }
    `;
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader))
    };

    // Setup Fragment Shader
    const fragmentShaderSource = `
        void main() {
            gl_FragColor = vec4(0, 1, 0.5, 1);
        }
    `;
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader))
    };


    // Link program
    const prg = gl.createProgram();
    gl.attachShader(prg, vertexShader);
    gl.attachShader(prg, fragmentShader);
    gl.linkProgram(prg);
    gl.useProgram(prg);
    if (!gl.getProgramParameter(prg, gl.LINK_STATUS)) {
        throw new Error(gl.getProgramInfoLog(prg))
    };

    // Detach and delete shaders
    gl.detachShader(prg, vertexShader);
    gl.deleteShader(vertexShader);
    gl.detachShader(prg, fragmentShader);
    gl.deleteShader(fragmentShader);


    // Get position attribute location
    const positionLoc = gl.getAttribLocation(prg, 'position');

    // Define triangle vertices
    const vertexPositions = new Float32Array([
        0, 0.7,
        0.5, -0.7,
        -0.5, -0.7,
    ]);

    // Insert vertex data into buffer
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);

    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(
        positionLoc,
        2,            // 2 values per vertex shader iteration
        gl.FLOAT,     // data is 32bit floats
        false,        // don't normalize
        0,            // stride (0 = auto)
        0,            // offset into buffer
    );

    gl.useProgram(prg);
}

