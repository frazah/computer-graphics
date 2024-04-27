function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function resizeCanvas() {
    const canvas = document.getElementById('webgl-canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.75;

}

function setupGraphics(gl) {
    // Setup Vertex Shader
    // A vertex shader's job is to compute vertex positions
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);

    // Setup Fragment Shader
    // A fragment shader's job is to compute the color of each pixel
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link program
    // A program is a combination of a vertex and a fragment shader
    var program = createProgram(gl, vertexShader, fragmentShader);


    // Get position attribute location
    // Now that we've created a GLSL program on the GPU we need to supply data to it. 
    // The majority of the WebGL API is about setting up state to supply data to
    // our GLSL programs. In this case our only input to our GLSL program is 
    // a_position which is an attribute. The first thing we should do is look up
    // the location of the attribute for the program we just created.
    var positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    var resolutionUniformLocation = gl.getUniformLocation(program, "u_resolution");

    var matrixLocation = gl.getUniformLocation(program, "u_matrix");



    // Create a buffer and bind it to the ARRAY_BUFFER
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Define rectangle vertices and store in buffer
    const vertexPositions = new Float32Array([
        0, -100,
        150, 125,
        -175, 100,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertexPositions, gl.STATIC_DRAW);
    // gl.STATIC_DRAW tells WebGL we are not likely to change this data much.

    // Now that we've put data in a buffer we need to tell the attribute how to get data out of it. 
    // First we need to create a collection of attribute state called a Vertex Array Object.
    var vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    gl.enableVertexAttribArray(positionAttributeLocation);

    var size = 2;          // 2 components per iteration
    var type = gl.FLOAT;   // the data is 32bit floats
    var normalize = false; // don't normalize the data
    var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    /*
        A hidden part of gl.vertexAttribPointer is that it binds the current ARRAY_BUFFER
        to the attribute. In other words now this attribute is bound to 
        positionBuffer. That means we're free to bind something else to 
        the ARRAY_BUFFER bind point. The attribute will continue to use 
        positionBuffer.
        
        vec4 is a 4 float value. In JavaScript you could think of it
        something like a_position = {x: 0, y: 0, z: 0, w: 0}.
        Above we set size = 2. Attributes default to 0, 0, 0, 1
        so this attribute will get its first 2 values (x and y)
        from our buffer. The z, and w will be the default 0 and 1 respectively.
    */


    gl.useProgram(program);
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    
    var translation = [200, 150];
    var angleInRadians = 0;
    var scale = [1, 1];
    // Compute the matrix
    var matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    // Set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);


    return program;
}

