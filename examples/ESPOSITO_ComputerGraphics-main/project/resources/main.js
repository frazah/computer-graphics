"use strict";

var canvas, textCanvas;
var ctx;

/** =================== varibili per text canvas 2d ================================== */
var frase_0 = "Premi W/S per muoverti in avanti/indietro";
var frase_1 = "Premi A/D per muoverti a sinistra/destra";
var frase_2 = "Premi Q/E per muoverti in alto/basso";
var frase_3 = "Premi G/K per ruotare a destra/sinistra";
var frase_4 = "Premi U/J per ruotare in alto/basso";
var frase_5 = "Premi le frecce per muovere la visuale: alto/basso/sinistra/destra";
var frase_6 = "Premi H per nascondere il pannello di interazione";
var frase_7 = "Premi R per resettare l'inclinazione";
var frase_8 = "Premi il tasto sinistro e trascina il mouse per ruotare la scena";
var frase_9 = "Premi la rotellina del mouse per zoomare";

var istruzioni = new Array(frase_0, frase_1, frase_2, frase_3, frase_4, frase_5, frase_6, frase_7, frase_8, frase_9);

//variabile per la posizione, la normale e le coordinate delle texture
var positions = [];
var normals = [];
var texcoords = [];

var numVertices;
var ambient;   //Ka
var diffuse;   //Kd
var specular;  //Ks
var emissive;  //Ke
var shininess; //Ns
var opacity;   //Ni
var ambientLight = [0.2, 0.2, 0.2];
var colorLight = [1.0, 1.0, 1.0];
var light_x, light_y, light_z;

//variabile per il controllo da tastiera
var keys = [];

var camera;
var pX = 3, pY = 0, pZ = 0;
var position = [pX, pY, pZ];
var up = [0, 1, 0];
var target = [0, 0, 0];

//Oggetto per la gestione della camera nel pannello di controllo
var controls = {
    lx: -1,
    ly: 3,
    lz: 5,
    theta: 0,
    phi: 0,
    fovy: 60.0,  // Field-of-view in Y direction angle (in degrees)
    trasparenza: true,
    enable: false
}

//variabili per la rotazione del modello
var THETA;
var PHI;

//variabile per la trasparenza

function main() {

    //Get A WebGL context
    canvas = new Canvas("mycanvas");

    //2D canvas for text
    textCanvas = document.getElementById('textCanvas');
    ctx = textCanvas.getContext('2d');
    makeTextCanvas(700, 500);

    //create control panel
    define_gui();

    //loading mesh objects
    var finestra = new Model("Finestra", "./objFiles/Stanza/Finestra/finestra.obj", "./objFiles/Stanza/Finestra/finestra.mtl", [0, 0, 0], false, canvas.gl);
    var landscape = new Model("Landscape", "./objFiles/Stanza/Finestra/Landscape/landscape.obj", "./objFiles/Finestra/Landscape/landscape.mtl", [0, 0, 0], false, canvas.gl);
    var maniglia = new Model("Maniglia", "./objFiles/Stanza/Finestra/Maniglia/maniglia.obj", "./objFiles/Stanza/Finestra/Maniglia/maniglia.mtl", [0, 0, 0], false, canvas.gl);
    var dipinto = new Model("Dipinto", "./objFiles/Dipinto/dipinto.obj", "./objFiles/Dipinto/dipinto.mtl", [0, 0, 0], false, canvas.gl);
    var dipinto = new Model("Dipinto", "./objFiles/Dipinto/dipinto2.obj", "./objFiles/Dipinto/dipinto2.mtl", [0, 0, 0], false, canvas.gl);
    var pavimento = new Model("Pavimento", "./objFiles/Stanza/Pavimento/pavimento.obj", "./objFiles/Stanza/Pavimento/pavimento.mtl", [0, 0, 0], false, canvas.gl);
    var wall = new Model("Wall", "./objFiles/Stanza/Mura/wall.obj", "./objFiles/Stanza/Mura/wall.mtl", [0, 0, 0], false, canvas.gl);
    var tavolo = new Model("TavoloWall", "./objFiles/Stanza/Tavolo/tavolo.obj", "./objFiles/Stanza/Tavolo/tavolo.mtl", [0, 0, 0], false, canvas.gl);
    var ring = new Model("Ring", "./objFiles/Ring/ring.obj", "./objFiles/Ring/ring.mtl", [0, 0, 0], false, canvas.gl);
    var trex = new Model("Trex", "./objFiles/Trex/trex.obj", "./objFiles/Trex/trex.mtl", [0, 0, 0], false, canvas.gl);
    var suzanne = new Model("Suzanne", "./objFiles/Suzanne/suzanne.obj", "./objFiles/Suzanne/suzanne.mtl", [0, 0, 0], false, canvas.gl);
    var cornice = new Model("Cornice", "./objFiles/Quadro/Cornice/cornice.obj", "./objFiles/Quadro/Cornice/cornice.mtl", [0, 0, 0], false, canvas.gl);
    var tela = new Model("Tela", "./objFiles/Quadro/Tela/tela.obj", "./objFiles/Quadro/Tela/tela.mtl", [0, 0, 0], false, canvas.gl);
    var lampadario = new Model("Lampadario", "./objFiles/Lighter/Lampadario/lampadario.obj", "./objFiles/Lighter/Lampadario/lampadario.mtl", [0, 0, 0], false, canvas.gl);
    var lampada = new Model("Lampada", "./objFiles/Lighter/Lampada/lampada.obj", "./objFiles/Lighter/Lampada/lampada.mtl", [0, 0, 0], false, canvas.gl);
    var vetro = new Model("Vetro", "./objFiles/Stanza/Finestra/Vetro/vetro.obj", "./objFiles/Stanza/Finestra/Vetro/vetro.mtl", [0, 0, 0], false, canvas.gl);

    //create camera and set attributes
    camera = new Camera(position, target, up);

    //draw models
    drawModels();
}

//start project
main();



//utility function to draw models
function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function radToDeg(r) {
    return r * 180 / Math.PI;
}

function degToRad(d) {
    return d * Math.PI / 180;
}


//function to handle keyboard events
function handleKeyboard() {

    let step = 0.01;

    if (keys["w"]) {
        camera.dolly(step)
    }
    if (keys["s"]) {
        camera.dolly(-step)
    }
    if (keys["a"]) {
        camera.truck(-step)
    }
    if (keys["d"]) {
        camera.truck(step)
    }
    if (keys["q"]) {
        camera.pedestal(step)
    }
    if (keys["e"]) {
        camera.pedestal(-step)
    }
    if (keys["g"]) {
        camera.cant(-step)
    }
    if (keys["k"]) {
        camera.cant(step)
    }
    if (keys["u"]) {
        camera.pedestal(step)
    }
    if (keys["j"]) {
        camera.pedestal(-step)
    }
    if (keys["ArrowUp"]) {
        camera.tilt(step)
    }
    if (keys["ArrowDown"]) {
        camera.tilt(-step)
    }
    if (keys["ArrowLeft"]) {
        camera.pan(step)
    }
    if (keys["ArrowRight"]) {
        camera.pan(-step)
    }
    if (keys["r"]) {
        camera.align()
    }
}
window.addEventListener('keydown', (e) => { keys[e.key] = true; });
window.addEventListener('keyup', (e) => { keys[e.key] = false; });

/*================= Mouse events ======================*/

var drag = false;
var old_x, old_y;
var dX = 0, dY = 0;

var mouseDown = function (e) {
    drag = true;
    old_x = e.pageX;
    old_y = e.pageY;

    e.preventDefault();
};
var mouseUp = function (e) {
    drag = false;
};
var mouseMove = function (e) {
    if (!drag) return false;
    dX = -(e.pageX - old_x) * 2 * Math.PI / canvas.canvas.width;
    dY = -(e.pageY - old_y) * 2 * Math.PI / canvas.canvas.height;
    camera.pan(dX * 0.5);
    camera.tilt(dY * 0.5);
    old_x = e.pageX;
    old_y = e.pageY;
    e.preventDefault();
};

var mouseWheel = function (e) {
    var delta = 0;
    if (!e) e = window.event;
    if (e.wheelDelta) {
        delta = e.wheelDelta / 120;
    } else if (e.detail) {
        delta = -e.detail / 3;
    }
    if (delta) {
        camera.dolly(delta * 0.1);
    }
    if (e.preventDefault) e.preventDefault();
    e.returnValue = false;
};


canvas.canvas.onmousedown = mouseDown;
canvas.canvas.onmouseup = mouseUp;
canvas.canvas.mouseout = mouseUp;
canvas.canvas.onmousemove = mouseMove;
canvas.canvas.onmousewheel = mouseWheel;

/*================= Touch events ======================*/
var touchStart = function (e) {
    drag = true;
    old_x = e.touches[0].pageX;
    old_y = e.touches[0].pageY;
    e.preventDefault();
}
var touchEnd = function (e) {
    drag = false;
}
var touchMove = function (e) {
    if (!drag) return false;
    dX = -(e.touches[0].pageX - old_x) * 2 * Math.PI / canvas.canvas.width;
    dY = -(e.touches[0].pageY - old_y) * 2 * Math.PI / canvas.canvas.height;
    camera.pan(dX * 0.5);
    camera.tilt(dY * 0.5);
    old_x = e.touches[0].pageX;
    old_y = e.touches[0].pageY;
    e.preventDefault();
}
canvas.canvas.ontouchstart = touchStart;
canvas.canvas.ontouchend = touchEnd;
canvas.canvas.ontouchmove = touchMove;





/* ===================== Pannello di controllo ========================= */
function define_gui() {
    var gui = new dat.GUI();

    gui.add(controls, "lx").min(-10).max(10).step(0.1).onChange(function () {

    });

    gui.add(controls, "ly").min(-10).max(10).step(0.1).onChange(function () {

    });

    gui.add(controls, "lz").min(-10).max(10).step(0.1).onChange(function () {

    });

    gui.add(controls, "theta").min(0).max(360).step(1).onChange(function () {

    });
    gui.add(controls, "phi").min(0).max(360).step(1).onChange(function () {

    });
    gui.add(controls, "fovy").min(10).max(120).step(5).onChange(function () {

    });
    gui.add(controls, "trasparenza").onChange(function(){
    });
    gui.add(controls, "enable");

    gui.close();
}

//draw text
function makeTextCanvas(width, height) {
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    ctx.font = "15px monospace";

    //ctx.textAlign = "center";
    //ctx.textBaseline = "middle";
    ctx.fillStyle = "black";
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    var img = new Image();
    img.src = "./img/foglio.webp";
    img.onload = function () {
        ctx.drawImage(img, 0, 0, ctx.canvas.width - 70, ctx.canvas.height);
        var size = 40;
        var gap = 25;
        ctx.fillText("Libretto istruzioni", 250, 30);
        istruzioni.forEach(element => {
            ctx.fillText(element, 0, size + gap);
            size += gap;
        });
        ctx.fillText("Camera PAD", 80, 330);
        makeKeyCanvas();
    }



    return ctx.canvas;
}


//draw buttons
function makeKeyCanvas() {

    var buttons = [];
    buttons.push(makeButton(1, 115, 425, 30, 30, '↓', 'skyblue', 'gray', 'black', function () { camera.dolly(-0.1); }))
    buttons.push(makeButton(2, 115, 355, 30, 30, '↑', 'skyblue', 'gray', 'black', function () { camera.dolly(0.1); }))
    buttons.push(makeButton(3, 148, 390, 30, 30, '→', 'skyblue', 'gray', 'black', function () { camera.pan(0.1); }))
    buttons.push(makeButton(4, 83, 390, 30, 30, '←', 'skyblue', 'gray', 'black', function () { camera.pan(-0.1); }))
    buttons.push(makeButton(5, 180, 315, 50, 20, 'reset', 'skyblue', 'gray', 'black', function () { camera.align(); }))

    drawAll();
    textCanvas.addEventListener("click", function (e) {
        if (ctx.isPointInPath(buttons[0], e.offsetX, e.offsetY)) {
            camera.dolly(-0.1);
        }
        if (ctx.isPointInPath(buttons[1], e.offsetX, e.offsetY)) {
            camera.dolly(0.1);
        }
        if (ctx.isPointInPath(buttons[2], e.offsetX, e.offsetY)) {
            camera.pan(-0.1);
        }
        if (ctx.isPointInPath(buttons[3], e.offsetX, e.offsetY)) {
            camera.pan(0.1);
        }
        if (ctx.isPointInPath(buttons[4], e.offsetX, e.offsetY)) {
            camera.getOriginalPosition();
        }
    });

    textCanvas.addEventListener('touchstart', function (e) {
        if (ctx.isPointInPath(buttons[0], e.offsetX, e.offsetY)) {
            camera.dolly(-0.1);
        }
        if (ctx.isPointInPath(buttons[1], e.offsetX, e.offsetY)) {
            camera.dolly(0.1);
        }
        if (ctx.isPointInPath(buttons[2], e.offsetX, e.offsetY)) {
            camera.pan(-0.1);
        }
        if (ctx.isPointInPath(buttons[3], e.offsetX, e.offsetY)) {
            camera.pan(0.1);
        }
        if (ctx.isPointInPath(buttons[4], e.offsetX, e.offsetY)) {
            camera.getOriginalPosition();
        }
    });


    function makeButton(id, x, y, w, h, label, fill, stroke, labelcolor, clickFn, releaseFn) {
        var button = new Path2D();
        button.rect(x, y, w, h);
        button.x = x;
        button.y = y;
        button.w = w;
        button.h = h;
        button.id = id;
        button.label = label;
        button.fill = fill;
        button.stroke = stroke;
        button.labelcolor = labelcolor;
        button.clickFn = clickFn;
        button.releaseFn = releaseFn;
        return button;
    }

    function drawAll() {
        for (var i = 0; i < buttons.length; i++) {
            drawButton(buttons[i], false);
        }
    }

    function drawButton(b, isDown) {
        ctx.clearRect(b.x - 1, b.y - 1, b.w + 2, b.h + 2);
        ctx.fillStyle = b.fill;
        ctx.fillRect(b.x, b.y, b.w, b.h);
        ctx.strokeStyle = b.stroke;
        ctx.strokeRect(b.x, b.y, b.w, b.h);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = b.labelcolor;
        ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2);
        if (isDown) {
            ctx.beginPath();
            ctx.moveTo(b.x, b.y + b.h);
            ctx.lineTo(b.x, b.y);
            ctx.lineTo(b.x + b.w, b.y);
            ctx.strokeStyle = 'black';
            ctx.stroke();
        }
    }
}

//call resize function on text canvas
window.onresize = function () {
    resizeCanvasToDisplaySize(ctx.canvas);
}