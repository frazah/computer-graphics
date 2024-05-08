//Funzione che carica una texture
function loadTexture(gl, path, fileName) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    const level = 0;
    const internalFormat = gl.RGBA;
    const width = 1;
    const height = 1;
    const border = 0;
    const srcFormat = gl.RGBA;
    const srcType = gl.UNSIGNED_BYTE;
    const pixel = new Uint8Array([255, 255, 255, 255]);  // opaque blue
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
        width, height, border, srcFormat, srcType, pixel);

    if (fileName) {
        const image = new Image();
        image.onload = function () {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            if (isPowerOf2(image.width) && isPowerOf2(image.height))
                gl.generateMipmap(gl.TEXTURE_2D); // Yes, it's a power of 2. Generate mips.
            else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        };
        image.src = path + fileName;
    }
    return texture;

    function isPowerOf2(value) {
        return (value & (value - 1)) == 0;
    }
}

//Funzione che utilizza la libreria glm_utils per leggere un eventuale 
//file MTL associato alla mesh
function readMTLFile(MTLfileName, mesh) {
    return $.ajax({
        type: "GET",
        url: MTLfileName,
        dataType: "text",
        async: false,
        success: parseMTLFile,
        error: handleError,
    });
    function parseMTLFile(result, status, xhr) {
        glmReadMTL(result, mesh);
    }
    function handleError(jqXhr, textStatus, errorMessage) {
        console.error('Error : ' + errorMessage);
    }
}

//Funzione che serve per recuperare i dati della mesh da un file OBJ
function retrieveDataFromSource(mesh) {
    loadMeshFromOBJ(mesh);
    if (mesh.fileMTL) {
        readMTLFile(mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/") + 1) + mesh.fileMTL, mesh.data);
        mesh.materials = mesh.data.materials;
        delete mesh.data.materials;
    }
}

//Funzione che utilizza la libreria glm_utils per leggere un file OBJ 
//contenente la definizione della mesh
function loadMeshFromOBJ(mesh) {
    return $.ajax({
        type: "GET",
        url: mesh.sourceMesh,
        dataType: "text",
        async: false,
        success: parseobjFile,
        error: handleError,
    });
    function parseobjFile(result, status, xhr) {
        var result = glmReadOBJ(result, new subd_mesh());
        //scommentare/commentare per utilizzare o meno la LoadSubdivMesh
        //         mesh.data = LoadSubdivMesh(result.mesh);
        mesh.data = result.mesh;
        mesh.fileMTL = result.fileMtl;
    }
    function handleError(jqXhr, textStatus, errorMessage) {
        console.error('Error : ' + errorMessage);
    }
}

/*========== Loading and storing the geometry ==========*/
function LoadMesh(gl, mesh) {

    retrieveDataFromSource(mesh);
    Unitize(mesh.data);
    //Ora che ho la mesh e il/i materiali associati, mi occupo di caricare 
    //la/le texture che tali materiali contengono
    var map = mesh.materials[1].parameter;
    var path = mesh.sourceMesh.substring(0, mesh.sourceMesh.lastIndexOf("/") + 1);
    map.set("map_Kd", loadTexture(gl, path, map.get("map_Kd")));

    var x = [], y = [], z = [];
    var xt = [], yt = [];
    var i0, i1, i2;
    var nvert = mesh.data.nvert;
    var nface = mesh.data.nface;
    var ntexcoord = mesh.data.textCoords.length;

    for (var i = 0; i < nvert; i++) {
        x[i] = mesh.data.vert[i + 1].x;
        y[i] = mesh.data.vert[i + 1].y;
        z[i] = mesh.data.vert[i + 1].z;
    }
    for (var i = 0; i < ntexcoord - 1; i++) {
        xt[i] = mesh.data.textCoords[i + 1].u;
        yt[i] = mesh.data.textCoords[i + 1].v;
    }
    for (var i = 1; i <= nface; i++) {
        i0 = mesh.data.face[i].vert[0] - 1;
        i1 = mesh.data.face[i].vert[1] - 1;
        i2 = mesh.data.face[i].vert[2] - 1;
        positions.push(x[i0], y[i0], z[i0], x[i1], y[i1], z[i1], x[i2], y[i2], z[i2]);
        i0 = mesh.data.facetnorms[i].i;
        i1 = mesh.data.facetnorms[i].j;
        i2 = mesh.data.facetnorms[i].k;
        normals.push(i0, i1, i2, i0, i1, i2, i0, i1, i2);
        i0 = mesh.data.face[i].textCoordsIndex[0] - 1;
        i1 = mesh.data.face[i].textCoordsIndex[1] - 1;
        i2 = mesh.data.face[i].textCoordsIndex[2] - 1;
        texcoords.push(xt[i0], yt[i0], xt[i1], yt[i1], xt[i2], yt[i2]);
    }
    numVertices = 3 * nface;

    if (mesh.fileMTL == null) {
        ambient = mesh.materials[0].parameter.get("Ka");
        diffuse = mesh.materials[0].parameter.get("Kd");
        specular = mesh.materials[0].parameter.get("Ks");
        emissive = mesh.materials[0].parameter.get("Ke");
        shininess = mesh.materials[0].parameter.get("Ns");
        opacity = mesh.materials[0].parameter.get("Ni");
    }
    else {
        ambient = mesh.materials[1].parameter.get("Ka");
        diffuse = mesh.materials[1].parameter.get("Kd");
        specular = mesh.materials[1].parameter.get("Ks");
        emissive = mesh.materials[1].parameter.get("Ke");
        shininess = mesh.materials[1].parameter.get("Ns");
        opacity = mesh.materials[1].parameter.get("Ni");
    }

}


function createXYQuadVertices() {
    var xOffset = 0;
    var yOffset = 0;
    var size = 1;
    return {
        position: {
            numComponents: 2,
            data: [
                xOffset + -1 * size, yOffset + -1 * size,
                xOffset + 1 * size, yOffset + -1 * size,
                xOffset + -1 * size, yOffset + 1 * size,
                xOffset + 1 * size, yOffset + 1 * size,
            ],
        },
        normal: [
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
        ],
        texcoord: [
            0, 0,
            1, 0,
            0, 1,
            1, 1,
        ],
        indices: [0, 1, 2, 2, 1, 3],
    };
}

function createCubeVertices() {
    const k = 1 / 2;

    const cornerVertices = [
        [-k, -k, -k],
        [+k, -k, -k],
        [-k, +k, -k],
        [+k, +k, -k],
        [-k, -k, +k],
        [+k, -k, +k],
        [-k, +k, +k],
        [+k, +k, +k],
    ];

    const faceNormals = [
        [+1, +0, +0],
        [-1, +0, +0],
        [+0, +1, +0],
        [+0, -1, +0],
        [+0, +0, +1],
        [+0, +0, -1],
    ];

    const uvCoords = [
        [1, 0],
        [0, 0],
        [0, 1],
        [1, 1],
    ];

    const numVertices = 6 * 4;
    const positions = webglUtils.createAugmentedTypedArray(3, numVertices);
    const normals = webglUtils.createAugmentedTypedArray(3, numVertices);
    const texCoords = webglUtils.createAugmentedTypedArray(2, numVertices);
    const indices = webglUtils.createAugmentedTypedArray(3, 6 * 2, Uint16Array);

    for (let f = 0; f < 6; ++f) {
        const faceIndices = CUBE_FACE_INDICES[f];
        for (let v = 0; v < 4; ++v) {
            const position = cornerVertices[faceIndices[v]];
            const normal = faceNormals[f];
            const uv = uvCoords[v];

            // Each face needs all four vertices because the normals and texture
            // coordinates are not all the same.
            positions.push(position);
            normals.push(normal);
            texCoords.push(uv);

        }
        // Two triangles make a square face.
        const offset = 4 * f;
        indices.push(offset + 0, offset + 1, offset + 2);
        indices.push(offset + 0, offset + 2, offset + 3);
    }

    return {
        position: positions,
        normal: normals,
        texcoord: texCoords,
        indices: indices,
    };
}

const CUBE_FACE_INDICES = [
    [3, 7, 5, 1], // right
    [6, 2, 0, 4], // left
    [6, 7, 3, 2], // ??
    [0, 1, 5, 4], // ??
    [7, 6, 4, 5], // front
    [2, 3, 1, 0], // back
  ];

/*
// This is not a full .obj parser.
// see http://paulbourke.net/dataformats/obj/

function parseOBJ(text) {
    // because indices are base 1 let's just fill in the 0th data
    const objPositions = [[0, 0, 0]];
    const objTexcoords = [[0, 0]];
    const objNormals = [[0, 0, 0]];
    const objColors = [[0, 0, 0]];

    // same order as `f` indices
    const objVertexData = [
        objPositions,
        objTexcoords,
        objNormals,
        objColors,
    ];

    // same order as `f` indices
    let webglVertexData = [
        [],   // positions
        [],   // texcoords
        [],   // normals
        [],   // colors
    ];

    const materialLibs = [];
    const geometries = [];
    let geometry;
    let groups = ['default'];
    let material = 'default';
    let object = 'default';

    const noop = () => { };

    function newGeometry() {
        // If there is an existing geometry and it's
        // not empty then start a new one.
        if (geometry && geometry.data.position.length) {
            geometry = undefined;
        }
    }

    function setGeometry() {
        if (!geometry) {
            const position = [];
            const texcoord = [];
            const normal = [];
            const color = [];
            webglVertexData = [
                position,
                texcoord,
                normal,
                color,
            ];
            geometry = {
                object,
                groups,
                material,
                data: {
                    position,
                    texcoord,
                    normal,
                    color,
                },
            };
            geometries.push(geometry);
        }
    }

    function addVertex(vert) {
        const ptn = vert.split('/');
        ptn.forEach((objIndexStr, i) => {
            if (!objIndexStr) {
                return;
            }
            const objIndex = parseInt(objIndexStr);
            const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
            webglVertexData[i].push(...objVertexData[i][index]);
            // if this is the position index (index 0) and we parsed
            // vertex colors then copy the vertex colors to the webgl vertex color data
            if (i === 0 && objColors.length > 1) {
                geometry.data.color.push(...objColors[index]);
            }
        });
    }

    const keywords = {
        v(parts) {
            // if there are more than 3 values here they are vertex colors
            if (parts.length > 3) {
                objPositions.push(parts.slice(0, 3).map(parseFloat));
                objColors.push(parts.slice(3).map(parseFloat));
            } else {
                objPositions.push(parts.map(parseFloat));
            }
        },
        vn(parts) {
            objNormals.push(parts.map(parseFloat));
        },
        vt(parts) {
            // should check for missing v and extra w?
            objTexcoords.push(parts.map(parseFloat));
        },
        f(parts) {
            setGeometry();
            const numTriangles = parts.length - 2;
            for (let tri = 0; tri < numTriangles; ++tri) {
                addVertex(parts[0]);
                addVertex(parts[tri + 1]);
                addVertex(parts[tri + 2]);
            }
        },
        s: noop,    // smoothing group
        mtllib(parts, unparsedArgs) {
            // the spec says there can be multiple filenames here
            // but many exist with spaces in a single filename
            materialLibs.push(unparsedArgs);
        },
        usemtl(parts, unparsedArgs) {
            material = unparsedArgs;
            newGeometry();
        },
        g(parts) {
            groups = parts;
            newGeometry();
        },
        o(parts, unparsedArgs) {
            object = unparsedArgs;
            newGeometry();
        },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
            continue;
        }
        handler(parts, unparsedArgs);
    }

    // remove any arrays that have no entries.
    for (const geometry of geometries) {
        geometry.data = Object.fromEntries(
            Object.entries(geometry.data).filter(([, array]) => array.length > 0));
    }

    return {
        geometries,
        materialLibs,
    };
}

function parseMTL(text) {
    const materials = {};
    let material;

    const keywords = {
        newmtl(parts, unparsedArgs) {
            material = {};
            materials[unparsedArgs] = material;
        },
        Ns(parts) { material.shininess = parseFloat(parts[0]); },
        Ka(parts) { material.ambient = parts.map(parseFloat); },
        Kd(parts) { material.diffuse = parts.map(parseFloat); },
        Ks(parts) { material.specular = parts.map(parseFloat); },
        Ke(parts) { material.emissive = parts.map(parseFloat); },
        map_Kd(parts, unparsedArgs) { material.diffuseMap = parseMapArgs(unparsedArgs); },
        map_Ns(parts, unparsedArgs) { material.specularMap = parseMapArgs(unparsedArgs); },
        map_Bump(parts, unparsedArgs) { material.normalMap = parseMapArgs(unparsedArgs); },
        Ni(parts) { material.opticalDensity = parseFloat(parts[0]); },
        d(parts) { material.opacity = parseFloat(parts[0]); },
        illum(parts) { material.illum = parseInt(parts[0]); },
    };

    const keywordRE = /(\w*)(?: )*(.*)/;
    const lines = text.split('\n');
    for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
        const line = lines[lineNo].trim();
        if (line === '' || line.startsWith('#')) {
            continue;
        }
        const m = keywordRE.exec(line);
        if (!m) {
            continue;
        }
        const [, keyword, unparsedArgs] = m;
        const parts = line.split(/\s+/).slice(1);
        const handler = keywords[keyword];
        if (!handler) {
            console.warn('unhandled keyword:', keyword);
            continue;
        }
        handler(parts, unparsedArgs);
    }

    return materials;
}

function parseMapArgs(unparsedArgs) {
    // TODO: handle options
    return unparsedArgs;
}


function getExtents(positions) {
    const min = positions.slice(0, 3);
    const max = positions.slice(0, 3);
    for (let i = 3; i < positions.length; i += 3) {
        for (let j = 0; j < 3; ++j) {
            const v = positions[i + j];
            min[j] = Math.min(v, min[j]);
            max[j] = Math.max(v, max[j]);
        }
    }
    return { min, max };
}

function getGeometriesExtents(geometries) {
    return geometries.reduce(({ min, max }, { data }) => {
        const minMax = getExtents(data.position);
        return {
            min: min.map((min, ndx) => Math.min(minMax.min[ndx], min)),
            max: max.map((max, ndx) => Math.max(minMax.max[ndx], max)),
        };
    }, {
        min: Array(3).fill(Number.POSITIVE_INFINITY),
        max: Array(3).fill(Number.NEGATIVE_INFINITY),
    });
}

function degToRad(deg) {
    return deg * Math.PI / 180;
}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

*/