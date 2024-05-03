"use strict";

async function main() {
    // Get A WebGL context
    /** @type {HTMLCanvasElement} */
    const canvas = document.querySelector("#canvas");
    const gl = canvas.getContext("webgl2");
    if (!gl) {
        return;
    }

    // Tell the twgl to match position with a_position etc..
    twgl.setAttributePrefix("a_");

    const vs = vertexShaderSource;;
    const fs = fragmentShaderSource;

    // compiles and links the shaders, looks up attribute and uniform locations
    const meshProgramInfo = twgl.createProgramInfo(gl, [vs, fs]);

    //const response = await fetch('https://webgl2fundamentals.org/webgl/resources/models/book-vertex-chameleon-study/book.obj');

    const objHref = 'resources/models/moon/moon.obj';
    const response = await fetch(objHref);
    const text = await response.text();
    const obj = parseOBJ(text);
    const baseHref = new URL(objHref, window.location.href);
    const matTexts = await Promise.all(obj.materialLibs.map(async filename => {
        const matHref = new URL(filename, baseHref).href;
        const response = await fetch(matHref);
        return await response.text();
    }));
    const materials = parseMTL(matTexts.join('\n'));

    const textures = {
        defaultWhite: twgl.createTexture(gl, { src: [255, 255, 255, 255] }),
    };

    const defaultMaterial = {
        diffuse: [1, 1, 1],
        diffuseMap: textures.defaultWhite,
        ambient: [0, 0, 0],
        specular: [1, 1, 1],
        shininess: 400,
        opacity: 1,
    };

    // load texture for materials
    for (const material of Object.values(materials)) {
        Object.entries(material)
            .filter(([key]) => key.endsWith('Map'))
            .forEach(([key, filename]) => {
                let texture = textures[filename];
                if (!texture) {
                    const textureHref = new URL(filename, baseHref).href;
                    texture = twgl.createTexture(gl, { src: textureHref, flipY: true });
                    textures[filename] = texture;
                }
                material[key] = texture;
            });
    }

    const parts = obj.geometries.map(({ material, data }) => {
        // Because data is just named arrays like this
        //
        // {
        //   position: [...],
        //   texcoord: [...],
        //   normal: [...],
        // }
        //
        // and because those names match the attributes in our vertex
        // shader we can pass it directly into `createBufferInfoFromArrays`
        // from the article "less code more fun".

        if (data.color) {
            if (data.position.length === data.color.length) {
                // it's 3. The our helper library assumes 4 so we need
                // to tell it there are only 3.
                data.color = { numComponents: 3, data: data.color };
            }
        } else {
            // there are no vertex colors so just use constant white
            data.color = { value: [1, 1, 1, 1] };
        }

        // create a buffer for each array by calling
        // gl.createBuffer, gl.bindBuffer, gl.bufferData
        const bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
        const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
        return {
            material: {
                ...defaultMaterial,
                ...materials[material],
            },
            bufferInfo,
            vao,
        };
    });


    const extents = getGeometriesExtents(obj.geometries);
    const range = m4.subtractVectors(extents.max, extents.min);

    // amount to move the object so its center is at the origin
    const objOffset = m4.scaleVector(
        m4.addVectors(
            extents.min,
            m4.scaleVector(range, 0.5)),
        -1);
    const cameraTarget = [0, 0, 0];

    // figure out how far away to move the camera so we can likely
    // see the object.
    const radius = m4.length(range) * 1.2;
    const cameraPosition = m4.addVectors(cameraTarget, [
        0,
        0,
        radius,
    ]);
    // Set zNear and zFar to something hopefully appropriate
    // for the size of this object.
    const zNear = radius / 100;
    const zFar = radius * 3;


    // First let's make some variables
    // to hold the translation,
    var fieldOfViewRadians = degToRad(60);
    var cameraAngleRadians = degToRad(0);
    var cam1OrthoUnits = 10;

    function setupGUI(cameraAngleRadians, fieldOfViewRadians, cam1OrthoUnits) {
        webglLessonsUI.setupSlider("#cameraAngle", { value: radToDeg(cameraAngleRadians), slide: updateCameraAngle, min: -360, max: 360 });
        webglLessonsUI.setupSlider("#fieldOfView", { value: radToDeg(fieldOfViewRadians), slide: updateFieldOfView, min: 1, max: 179 });
        webglLessonsUI.setupSlider("#camOrtho", { value: cam1OrthoUnits, slide: updateOrtho, min: 1, max: 50 });
    }

    function updateFieldOfView(event, ui) {
        fieldOfViewRadians = degToRad(ui.value);
        //drawScene();
    }

    function updateCameraAngle(event, ui) {
        cameraAngleRadians = degToRad(ui.value);
        //drawScene();
    }

    function updateOrtho(event, ui) {
        cam1OrthoUnits = ui.value;
        //drawScene();
    }

    // Setup a ui.
    setupGUI(fieldOfViewRadians, cameraAngleRadians, cam1OrthoUnits);


    function render(time) {
        time *= 0.001;  // convert to seconds

        var numObjects = 1;

        twgl.resizeCanvasToDisplaySize(gl.canvas);
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.enable(gl.DEPTH_TEST);

        //const fieldOfViewRadians = degToRad(60);
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;

        // Orthographic camera 
        var cam1Ortho = false;

        var projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

        if (cam1Ortho) {
            projection = m4.orthographic(
                -cam1OrthoUnits * aspect,  // left
                cam1OrthoUnits * aspect,  // right
                -cam1OrthoUnits,           // bottom
                cam1OrthoUnits,           // top
                zNear,
                zFar);
        }



        const up = [0, 1, 0];
        // Compute the camera's matrix using look at.
        //const camera = m4.lookAt(cameraPosition, cameraTarget, up);
        var camera = m4.yRotation(cameraAngleRadians);
        camera = m4.translate(camera, 0, 0, radius * 1.5);

        // Make a view matrix from the camera matrix.
        const view = m4.inverse(camera);

        const sharedUniforms = {
            u_lightDirection: m4.normalize([-1, 3, 5]),
            u_view: view,
            u_projection: projection,
        };

        gl.useProgram(meshProgramInfo.program);

        // calls gl.uniform
        twgl.setUniforms(meshProgramInfo, sharedUniforms);

        for (let i = 0; i < numObjects; ++i) {
            // compute the world matrix once since all parts
            // are at the same space.
            var angle = i * Math.PI * 2 / numObjects;
            var x = Math.cos(angle) * radius;
            var z = Math.sin(angle) * radius;
            //let u_world = m4.yRotation(time);
            let u_world = m4.yRotation(time);
            //u_world = m4.translate(u_world, ...objOffset);
            u_world = m4.translate(u_world, x, 0, z);

            for (const { bufferInfo, vao, material } of parts) {
                // set the attributes for this part.
                gl.bindVertexArray(vao);

                // calls gl.uniform
                twgl.setUniforms(meshProgramInfo, {
                    u_world,
                }, material);

                // calls gl.drawArrays or gl.drawElements
                twgl.drawBufferInfo(gl, bufferInfo);
            }

            requestAnimationFrame(render);
        }
    }
    requestAnimationFrame(render);
}

main();