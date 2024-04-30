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

    /*
    gui.add(state, "points", 3, 24, 1).listen();
    setInterval(() => {
        ++state.points;

        if (state.points > 24) {
            state.points = 3;
        }
    }, 100);

    gui.add(state, "points", 3, 24, 1).onChange((value) => {
        console.log(value);
    });
    */
}