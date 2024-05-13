class Canvas {

    constructor(canvas_id)
    {
        /** @type {HTMLCanvasElement} */
        this.canvas = document.getElementById(canvas_id);

        this.gl = this.canvas.getContext("webgl");

        // enabling depth testing
        this.gl.enable(this.gl.DEPTH_TEST);
        // this.gl.depthFunc(this.gl.LESS); // normalmente settata di default

        // enabling alpha blending
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        if (!this.gl) {
            alert("WEBGL not supported");
            return;
        }

        this.mesh_list = []; //Array di oggetti mesh

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);

        // Compiling vertex and fragment shader
        this.programInfo = webglUtils.createProgramInfo(this.gl, ["3d-vertex-shader", "3d-fragment-shader"]);
		this.gl.useProgram(this.programInfo.program);
	}	   
}


function resizeCanvasToDisplaySize(canvas) {
    // Lookup the size the browser is displaying the canvas in CSS pixels.
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    // Check if the canvas is not the same size.
    const needResize = canvas.width !== displayWidth ||
        canvas.height !== displayHeight;

    if (needResize) {
        // Make the canvas the same size
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    return needResize;
}