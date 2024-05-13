class Model {
	constructor(objName, objSource, objMtl, objPosition, objRotate, gl) {

		this.name = objName;
		this.obj_source = objSource;
		this.mtl_source = objMtl;
		this.position = objPosition;
		this.mesh = []; // Salva l'informazione della mesh
		this.mesh.sourceMesh = this.obj_source; // .sourceMesh viene usato per caricare la mesh con load_mesh.js
		this.mesh.fileMTL = this.mtl_source; // viene usato per caricare la texture

		if (objRotate) { // Used for world matrix transform
			this.rotate = objRotate;
			this.angle = 0;
		}

		this.ready = false;

		LoadMesh(gl, this.mesh).then(() => { window['canvas'].mesh_list.push(this); this.createBuffer(gl, window['canvas'].programInfo); });


	}

	createBuffer(gl, programInfo) {
		let m = this.mesh;
			
		// look up where the vertex data needs to go.
		this.positionLocation = gl.getAttribLocation(programInfo.program, "a_position");
		this.normalLocation = gl.getAttribLocation(programInfo.program, "a_normal");
		this.texcoordLocation = gl.getAttribLocation(programInfo.program, "a_texcoord");

		// Create a buffer for positions
		this.positionBuffer = gl.createBuffer();
		// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		// Put the positions in the buffer
		//setGeometry(gl);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.positions), gl.STATIC_DRAW);

		// Create a buffer for normals
		this.normalsBuffer = gl.createBuffer();
		// Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER mormalsBuffer)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		// Put the normals in the buffer
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.normals), gl.STATIC_DRAW);

		// provide texture coordinates
		this.texcoordBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);
		// Set Texcoords
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.texcoords), gl.STATIC_DRAW);

		// Get the starting time.
		let numVertices = m.numVertices;
		let texture = m.texture
	}


	draw(gl, programInfo, PHI = 0, THETA = 0, fieldOfViewRadians = degToRad(60), zmin = 0.1, far = 100, light_x = -1, light_y = 3, light_z = 5, trasparenza = true) {
		let m = this.mesh;
		
		// Compute the projection matrix
		var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
		var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, zmin, far)

		// Make a view matrix from the camera matrix.
		var viewMatrix = camera.getViewMatrix();

		gl.uniform3fv(gl.getUniformLocation(programInfo.program, "diffuse"), m.diffuse);
		gl.uniform3fv(gl.getUniformLocation(programInfo.program, "ambient"), m.ambient);
		gl.uniform3fv(gl.getUniformLocation(programInfo.program, "specular"), m.specular);
		gl.uniform3fv(gl.getUniformLocation(programInfo.program, "emissive"), m.emissive);
		gl.uniform3fv(gl.getUniformLocation(programInfo.program, "u_ambientLight"), ambientLight);
		gl.uniform3fv(gl.getUniformLocation(programInfo.program, "u_colorLight"), colorLight);
		gl.uniform1f(gl.getUniformLocation(programInfo.program, "shininess"), m.shininess)
		gl.uniform1f(gl.getUniformLocation(programInfo.program, "opacity"), m.opacity)
		if(this.name == 'Vetro' || this.name == 'Lampada')
		{
			if(trasparenza == true)
			{
				gl.uniform1f(gl.getUniformLocation(programInfo.program, "uAlpha"), 0.5);

			}
			else
			{
				gl.uniform1f(gl.getUniformLocation(programInfo.program, "uAlpha"), 1);
			}
		}
		else
		{
			gl.uniform1f(gl.getUniformLocation(programInfo.program, "uAlpha"), 1);
		}


		// Turn on the position attribute
		gl.enableVertexAttribArray(this.positionLocation);

		// Bind the position buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);

		// Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		var size = 3;          // 3 components per iteration
		var type = gl.FLOAT;   // the data is 32bit floats
		var normalize = false; // don't normalize the data
		var stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
		var offset = 0;        // start at the beginning of the buffer
		gl.vertexAttribPointer(this.positionLocation, size, type, normalize, stride, offset);

		// Turn on the normal attribute
		gl.enableVertexAttribArray(this.normalLocation);
		// Bind the normal buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalsBuffer);
		gl.vertexAttribPointer(this.normalLocation, size, type, normalize, stride, offset);

		// Turn on the teccord attribute
		gl.enableVertexAttribArray(this.texcoordLocation);
		// Bind the position buffer.
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texcoordBuffer);

		// Tell the position attribute how to get data out of positionBuffer (ARRAY_BUFFER)
		size = 2;          // 2 components per iteration
		gl.vertexAttribPointer(this.texcoordLocation, size, type, normalize, stride, offset)

		gl.bindTexture(gl.TEXTURE_2D, this.mesh.texture);

		var matrixLocation = gl.getUniformLocation(programInfo.program, "u_world");
		var textureLocation = gl.getUniformLocation(programInfo.program, "diffuseMap");
		var viewMatrixLocation = gl.getUniformLocation(programInfo.program, "u_view");
		var projectionMatrixLocation = gl.getUniformLocation(programInfo.program, "u_projection");
		var lightWorldDirectionLocation = gl.getUniformLocation(programInfo.program, "u_lightDirection");
		var viewWorldPositionLocation = gl.getUniformLocation(programInfo.program, "u_viewWorldPosition");

		gl.uniformMatrix4fv(viewMatrixLocation, false, viewMatrix);
		gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);

		// set the light position
		gl.uniform3fv(lightWorldDirectionLocation, m4.normalize([light_x, light_y, light_z]));

		// set the camera/view position
		gl.uniform3fv(viewWorldPositionLocation,camera.getPosition());

		// Tell the shader to use texture unit 0 for diffuseMap
		gl.uniform1i(textureLocation, 0);


		// Tell WebGL how to convert from clip space to pixels
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);


		gl.enable(gl.CULL_FACE);

		// Set the matrix.
		var matrix = m4.identity();
		matrix = m4.yRotate(matrix, degToRad(PHI));
		matrix = m4.xRotate(matrix, degToRad(THETA));

		gl.uniformMatrix4fv(matrixLocation, false, matrix);
		// Draw the geometry.
		gl.drawArrays(gl.TRIANGLES, 0, this.mesh.numVertices);

	}
}


function drawModels() {
	
	
	handleKeyboard();
	resizeCanvasToDisplaySize(canvas.gl.canvas);

	//define_gui();
	canvas.gl.clear(canvas.gl.COLOR_BUFFER_BIT | canvas.gl.DEPTH_BUFFER_BIT);

	
	canvas.gl.viewport(0, 0, canvas.gl.canvas.width, canvas.gl.canvas.height);
	canvas.gl.enable(canvas.gl.CULL_FACE);
	canvas.gl.enable(canvas.gl.DEPTH_TEST);

	// draw scene to the canvas projecting the depth texture into the scene
	canvas.gl.bindFramebuffer(canvas.gl.FRAMEBUFFER, null);
	canvas.gl.clearColor(0, 0, 0, 0);

	if(controls.enable)
	{
		canvas.mesh_list.forEach(function (mesh) {
			mesh.draw(canvas.gl, canvas.programInfo, controls.phi, controls.theta, degToRad(controls.fovy), controls.near, controls.far, controls.lx, controls.ly, controls.lz, controls.trasparenza);
		}.bind(this));
	}
	else
	{
		canvas.mesh_list.forEach(function (mesh) {
			mesh.draw(canvas.gl, canvas.programInfo);
		}.bind(this));
	}

	requestAnimationFrame(drawModels);
}

