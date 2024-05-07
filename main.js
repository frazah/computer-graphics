"use strict";

var mesh = new Array();
var positions = [];
var normals = [];
var texcoords = [];
var numVertices;
var lightDirection = [0.5, 0.7, 1];
var ambient;   //Ka
var diffuse;   //Kd
var specular;  //Ks
var emissive;  //Ke
var shininess; //Ns
var opacity;   //Ni

function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl");
  if (!gl) {
    return;
  }
  webglUtils.resizeCanvasToDisplaySize(gl.canvas);

  mesh.sourceMesh = 'resources/models/moon/moon.obj';
  LoadMesh(gl, mesh);

  // setup GLSL program
  var program = webglUtils.createProgramFromScripts(gl, ["3d-vertex-shader", "3d-fragment-shader"]);
  // Tell it to use our program (pair of shaders)
  gl.useProgram(program);

  // look up where the vertex data needs to go.
  var positionLocation = gl.getAttribLocation(program, "a_position");
  var normalLocation = gl.getAttribLocation(program, "a_normal");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");

  // Create a buffer for positions
  var positionBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Put the positions in the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  // Create a buffer for normals
  var normalsBuffer = gl.createBuffer();
  // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalsBuffer)
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  // Put the normals in the buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);

  // provide texture coordinates
  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // Set Texcoords
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  var ambientLight = [0.2, 0.2, 0.2];
  var colorLight = [1.0, 1.0, 1.0];

  gl.uniform3fv(gl.getUniformLocation(program, "diffuse"), diffuse);
  gl.uniform3fv(gl.getUniformLocation(program, "ambient"), ambient);
  gl.uniform3fv(gl.getUniformLocation(program, "specular"), specular);
  gl.uniform3fv(gl.getUniformLocation(program, "emissive"), emissive);
  gl.uniform3fv(gl.getUniformLocation(program, "u_lightDirection" ), lightDirection );
  gl.uniform3fv(gl.getUniformLocation(program, "u_ambientLight"), ambientLight);
  gl.uniform3fv(gl.getUniformLocation(program, "u_colorLight"), colorLight);
  gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);
  gl.uniform1f(gl.getUniformLocation(program, "opacity"), opacity);

  // Turn on the position attribute
  gl.enableVertexAttribArray(positionLocation);
  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  var size = 3;          // 3 components per iteration
  var type = gl.FLOAT;   // the data is 32bit floats
  var normalize = false; // don't normalize the data
  var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
  var offset = 0;        // start at the beginning of the buffer
  gl.vertexAttribPointer(positionLocation, size, type, normalize, stride, offset);

  // Turn on the normal attribute
  gl.enableVertexAttribArray(normalLocation);
  // Bind the normal buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer);
  gl.vertexAttribPointer(normalLocation, size, type, normalize, stride, offset);

  // Turn on the texcord attribute
  gl.enableVertexAttribArray(texcoordLocation);
  // Bind the position buffer.
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  // Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
  size = 2;          // 2 components per iteration
  gl.vertexAttribPointer(texcoordLocation, size, type, normalize, stride, offset);

  ////////////////////////////////

  var controls = {
    enable: true,
    cameraX: 4.5,
    cameraY: 4.5,
    cameraZ: 2,
    cameraAngleRadians: degToRad(0),
    fieldOfViewRadians: degToRad(90),
  };

  var modelXRotationRadians = degToRad(0);
  var modelYRotationRadians = degToRad(0);

  // Compute the projection matrix
  var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
  var zmin = 1;
  var zmax = 500;
  var projectionMatrix = m4.perspective(controls.fieldOfViewRadians, aspect, zmin, zmax);

  var cameraPosition = [controls.cameraX, controls.cameraY, controls.cameraZ];
  var up = [0, 0, 1];
  var target = [0, 0, 0];
  var radius = 2;

  // Compute the camera's matrix using look at.
  //var cameraMatrix = m4.lookAt(cameraPosition, target, up);
  var cameraMatrix = m4.yRotation(controls.cameraAngleRadians);
  cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 2);

  // Make a view matrix from the camera matrix.
  var viewMatrix = m4.inverse(cameraMatrix);

  var matrixLocation = gl.getUniformLocation(program, "u_world");
  var textureLocation = gl.getUniformLocation(program, "diffuseMap");
  var viewMatrixLocation = gl.getUniformLocation(program, "u_view");
  var projectionMatrixLocation = gl.getUniformLocation(program, "u_projection");
  var lightWorldDirectionLocation = gl.getUniformLocation(program, "u_lightDirection");
  var viewWorldPositionLocation = gl.getUniformLocation(program, "u_viewWorldPosition");

  gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
  gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
        
  // set the light position
  gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([-1, 3, 5]));

  // set the camera/view position
  gl.uniform3fv(viewWorldPositionLocation, cameraPosition);

  // Tell the shader to use texture unit 0 for diffuseMap
  gl.uniform1i(textureLocation, 0);

  ////////////////////////////////

  function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
  }

  function radToDeg(r) {
    return r * 180 / Math.PI;
  }

  function degToRad(d) {
    return d * Math.PI / 180;
  }

  // Creating a GUI
  var gui = new dat.GUI({ autoPlace: false });

  // Position
  document.querySelector("#gui").append(gui.domElement);

  
  // Add controller.
  gui.add(controls, 'cameraAngleRadians').min(0).max(360).step(1).name('Camera Angle').onChange(updateCamera);
  gui.add(controls, 'fieldOfViewRadians').min(30).max(120).step(1).name('Field of View').onChange(updateCamera);

  function updateCamera() {
    // Compute the projection matrix
    var projectionMatrix = m4.perspective(degToRad(controls.fieldOfViewRadians), aspect, zmin, zmax);

    // Compute the camera's matrix using look at.
    //var cameraMatrix = m4.lookAt(cameraPosition, target, up);
    var cameraMatrix = m4.yRotation(degToRad(controls.cameraAngleRadians));
    cameraMatrix = m4.translate(cameraMatrix, 0, 0, radius * 2);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
  }

  // Get the starting time.
  var then = 0;


  var numObjects = 3;



  // Add mouse event listener for yRotation
  var yRotation = 0;
  var xRotation = 0;
  var radius = 2;
  var isDragging = false;
  var lastX = -1, lastY = -1;

  canvas.addEventListener('mousedown', function (event) {
    isDragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
  }
  );

  canvas.addEventListener('mousemove', function (event) {
    if (isDragging) {
      var x = event.clientX;
      var y = event.clientY;
      var dx = x - lastX;
      var dy = y - lastY;
      lastX = x;
      lastY = y;

      yRotation += dx * 0.01;
      xRotation += dy * 0.01;
    }
  }
  );

  canvas.addEventListener('mouseup', function (event) {
    isDragging = false;
  }
  );

  // Add touch event listener for yRotation
  canvas.addEventListener('touchstart', function (event) {
    isDragging = true;
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
  }
  );

  canvas.addEventListener('touchmove', function (event) {
    if (isDragging) {
      var x = event.touches[0].clientX;
      var y = event.touches[0].clientY;
      var dx = x - lastX;
      var dy = y - lastY;
      lastX = x;
      lastY = y;

      yRotation += dx * 0.01;
      xRotation += dy * 0.01;
    }
  }
  );

  canvas.addEventListener('touchend', function (event) {
    isDragging = false;
  }
  );

  // Add keyboard event listener for yRotation with arrow keys that increase/decrease the rotation
  window.addEventListener('keydown', function (event) {
    switch (event.key) {
      case 'ArrowLeft':
        yRotation += 0.1;
        break;
      case 'ArrowRight':
        yRotation -= 0.1;
        break;
      case 'ArrowUp':
        xRotation += 0.1;
        break;
      case 'ArrowDown':
        xRotation -= 0.1;
        break;
    }
  }
  );




  requestAnimationFrame(drawScene);

  // Draw the scene.
  function drawScene(time) {
    // convert to seconds
    time *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = time - then;
    // Remember the current time for the next frame.
    then = time;

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    //gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);

    // Animate the rotation
    //modelYRotationRadians += -0.5 * deltaTime;
    //modelXRotationRadians += -0.0 * deltaTime;

    // Clear the canvas AND the depth buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var matrix = m4.identity();
    //matrix = m4.xRotate(matrix, modelXRotationRadians);
    //matrix = m4.yRotate(matrix, modelYRotationRadians);

    for (let i = 0; i < numObjects; ++i) {
      var angle = i * Math.PI * 2 / numObjects;
      var x = Math.cos(angle) * radius;
      var z = Math.sin(angle) * radius;
      matrix = m4.yRotation(yRotation);
      matrix = m4.translate(matrix, x, 0, z);

      // Set the matrix.
      gl.uniformMatrix4fv(matrixLocation, false, matrix);

      // Draw the geometry.
      gl.drawArrays(gl.TRIANGLES, 0, numVertices);
    }

    requestAnimationFrame(drawScene);
  }
}

main();