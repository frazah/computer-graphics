    // Setup a ui.
    //setupGUI();
    webglLessonsUI.setupSlider("#cameraAngle", { value: radToDeg(cameraAngleRadians), slide: updateCameraAngle, min: -360, max: 360 });
    webglLessonsUI.setupSlider("#fieldOfView", { value: radToDeg(fieldOfViewRadians), slide: updateFieldOfView, min: 1, max: 179 });
    webglLessonsUI.setupSlider("#camOrtho", { value: fieldOfViewRadians, slide:  updateOrtho, min: 1, max: 50 });


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



/*
function setupGUI(fieldOfView, cameraAngle) {
    // Creating a GUI
    var gui = new dat.GUI({ autoPlace: false });

    // Position
    document.querySelector("#gui").append(gui.domElement);

    // Add a folder
    //var folder1 = gui.addFolder('Flow Field');

    // Add a string controller.
    var person = { name: 'Sam' };
    gui.add(person, 'name');

    // Add a number controller slider.
    var camera = { fieldOfView: fieldOfView, cameraAngle: cameraAngle };
    gui.add(camera, 'fieldOfView', 0, 180, 10);
    gui.add(camera, 'cameraAngle', 0, 360, 10);

    var palette = {
        color: [0, 128, 255], // RGB array
    };
    gui.addColor(palette, 'color');

    const state = {
        animate: true,
        options: 'Option 1',
    };

    gui.add(state, "animate")

    gui.add(state, 'options', ['Option 1', 'Option 2', 'Option 3']);

}
*/
