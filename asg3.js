// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_GlobalRotateMatrix;\n' +
    'void main() {\n' +
    ' gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    'precision mediump float;\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';


// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
var u_ModelMatrix;
var u_GlobalRotateMatrix;

let g_earAngle = 0;
let g_upperLegAngle = 0;
let g_lowerLegAngle = 0;

g_earAnimation = false;
g_legsAnimation = false;
g_toesAnimation = false;
g_walkAnimation = false;


// Global variables to track mouse state
let isDragging = false;
let lastMouseX = 0;
let lastMouseY = 0;

// Add global variable to track the special animation state
let isJumping = false;
let jumpHeight = 0.0;
let jumpSpeed = 0.05; // Speed of the jump
let jumpMaxHeight = 0.5; // Maximum height of the jump

function initMouseControl() {
    canvas.onmousedown = function (event) {
        if (event.shiftKey) {
            isJumping = true; // Start the jump animation
            return; // Prevent normal rotation logic when jumping
        }
        isDragging = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
    };

    canvas.onmouseup = function (event) {
        isDragging = false;
    };

    canvas.onmouseout = function (event) {
        isDragging = false;
    };

    canvas.onmousemove = function (event) {
        if (isDragging) {
            var x = event.clientX;
            var y = event.clientY;
            var deltaX = x - lastMouseX;
            var deltaY = y - lastMouseY;

            g_globalAngleX += deltaX * 0.1; 
            g_globalAngleY += deltaY * 0.1; 

            lastMouseX = x;
            lastMouseY = y;

            renderScene();
        }
    };
}

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preseveDrawingBuffer: true }); // gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }
    // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }
    // Get the storage location of u_FragColor
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get u_GlobalRotateMatrix');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Global variables related to UI elements
let g_globalAngleX = 30;
let g_globalAngleY = 0;

// Set up actions for the HTML UI elements
function addActionsForHTMLUI() {
    document.getElementById('x_slider').addEventListener('mousemove', function () { g_globalAngleX = parseInt(this.value); renderScene(); });
    document.getElementById('y_slider').addEventListener('mousemove', function () { g_globalAngleY = parseInt(this.value); renderScene(); });

    document.getElementById('ear_slider').addEventListener('input', function () {
        g_earAngle = this.value; renderScene();
    });

    document.getElementById('upper_leg_slider').addEventListener('input', function () {
        g_upperLegAngle = this.value; renderScene();
    });

    document.getElementById('lower_leg_slider').addEventListener('input', function () {
        g_lowerLegAngle = this.value; renderScene();
    });

    document.getElementById('on_ear').onclick = function () { g_earAnimation = true; };
    document.getElementById('off_ear').onclick = function () { g_earAnimation = false; };
    document.getElementById('on_legs').onclick = function () { g_legsAnimation = true; };
    document.getElementById('off_legs').onclick = function () { g_legsAnimation = false; };
    document.getElementById('on_toes').onclick = function () { g_toesAnimation = true; };
    document.getElementById('off_toes').onclick = function () { g_toesAnimation = false; };
    document.getElementById('on_walk').onclick = function () { g_walkAnimation = true; };
    document.getElementById('off_walk').onclick = function () { g_walkAnimation = false; g_legsAnimation = false; g_toesAnimation = false; g_earAnimation = false; };


}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addActionsForHTMLUI();
    initMouseControl();
    gl.clearColor(0.3, 0.8, 0.2, 1.0);
    renderScene();
    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
let g_stats = 0;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}

let jumpPhase = 0; // Tracks the phase of the jump to synchronize animations

function updateAnimationAngles() {
    if (isJumping) {
        // Calculate a bounce effect for the jump height
        jumpHeight = 0.5 * Math.abs(Math.sin(2 * Math.PI * jumpPhase)); // Sine wave for smooth jumping
        jumpPhase += 0.01; // Increment phase

        // Reset jump when phase completes a cycle
        if (jumpPhase > 1) {
            isJumping = false;
            jumpPhase = 0;
        }

        // Adjust leg angles for jumping
        g_upperLegAngle = 20 * Math.sin(2 * Math.PI * jumpPhase);
        g_lowerLegAngle = -20 * Math.sin(2 * Math.PI * jumpPhase);

        // Ears and head can react to the jump
        g_earAngle = 15 * Math.sin(2 * Math.PI * jumpPhase);
    }

    if (g_earAnimation) {
        g_earAngle = 45 * Math.sin(3 * g_seconds);
    }

    if (g_legsAnimation) {
        g_upperLegAngle = 30 * Math.sin(5 * g_seconds);
    }

    if (g_toesAnimation) {
        g_lowerLegAngle = 45 * Math.sin(3 * g_seconds);
    }

    if (g_walkAnimation) {
        g_earAnimation = true;
        g_legsAnimation = true;
        g_toesAnimation = true;
    }

}



function renderScene() {

    var startTime = performance.now();
    // Calculate global rotation matrix
    var globalRotMat = new Matrix4();
    globalRotMat.rotate(g_globalAngleX, 0, 1, 0);
    globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
    globalRotMat.translate(0, jumpHeight, 0); // Apply the jump translation
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear the canvas
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the rabbit-like creature
    drawAnimal();

    var duration = performance.now() - startTime;
    sendTextToHTML(" fps: " + Math.floor(10000 / duration) / 10, "numdot");
}

function drawAnimal() {
    // Define body
    var body = new Cube();
    body.color = [1.0, 0.5, 0.0, 1.0];
    body.matrix.translate(-0.2, 0, 0);
    body.matrix.scale(0.5, 0.2, 0.4);
    body.render();

    // Define head
    var head = new Cube();
    head.color = [1.0, 0.8, 0.6, 1.0];
    head.matrix.translate(0.2, 0.15, 0);
    head.matrix.scale(0.2, 0.2, 0.2);
    head.render();

    // Define ears using a loop for both ears
    for (var i = -1; i <= 1; i += 2) {
        var ear = new Cube();
        ear.color = [1.0, 1.0, 0.0, 1.0];
        ear.matrix.translate(0.2, 0.35, i * 0.05);
        ear.matrix.rotate(g_earAngle, 0, 0, 1);
        ear.matrix.scale(0.05, 0.15, 0.05);
        ear.render();
    }

    // Define legs using a loop for all four
    var legPositions = [[0.15, -0.1, 0.15], [0.15, -0.1, -0.15], [-0.15, -0.1, 0.15], [-0.15, -0.1, -0.15]];
    front = true;
    for (var i = 0; i < legPositions.length; i++) {
        var upperLeg = new Cube();
        upperLeg.color = [1.0, 0.5, 0.0, 1.0]; // White upper leg
        upperLeg.matrix.translate(...legPositions[i]);
        if (front) {
            upperLeg.matrix.rotate(g_upperLegAngle, 1, 0, 0); // Use global angle for the upper leg rotation
            front = false;
        } else {
            upperLeg.matrix.rotate(-g_upperLegAngle, 1, 0, 0); // Use global angle for the upper leg rotation
            front = true;
        }
        upperLeg.matrix.scale(0.05, 0.2, 0.05); // Change to 0.2 for leg length
        // Save the transformation state of the upper leg
        var upperLegMatrix = new Matrix4(upperLeg.matrix);
        upperLeg.render();

        var lowerLeg = new Cube();
        lowerLeg.color = [0.647, 0.165, 0.165, 1.0];
        // Start the lower leg's transformation relative to the upper leg
        lowerLeg.matrix = upperLegMatrix;
        lowerLeg.matrix.translate(0, -0.2, 0); // Move down to the end of the upper leg
        lowerLeg.matrix.rotate(g_lowerLegAngle, 1, 0, 0); // Use global angle for the lower leg rotation
        lowerLeg.matrix.scale(1, 0.5, 1); // Non-uniform scaling to maintain thickness
        lowerLeg.render();
    }


    // Tail definition using a cylinder instead of a cube
    var tailPosition = [-0.3, 0.05, 0]; // Tail position
    var tailHeight = 0.1; // Tail cylinder height
    var tailRadius = 0.05; // Tail cylinder radius
    var tailColor = [1.0, 0.8, 0.6, 1.0]; // Tail color, matching the head

    // Set matrix for tail positioning
    var tailMatrix = new Matrix4();
    tailMatrix.translate(...tailPosition);
    tailMatrix.rotate(-90, 1, 0, 0); // Rotate to point tail up or along the desired axis

    // Apply the tail matrix to the model matrix uniform
    gl.uniformMatrix4fv(u_ModelMatrix, false, tailMatrix.elements);

    // Draw cylinder tail
    drawCylinder(20, tailHeight, tailRadius, tailColor);

    // Reset matrix for other models
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

// Debug stats
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}


function drawCylinder(numSegments, height, radius, color) {
    let vertices = [];
    let angleStep = (Math.PI * 2) / numSegments;

    // Generate the top and bottom circle vertices
    for (let i = 0; i <= numSegments; i++) {
        let angle = i * angleStep;
        let x = radius * Math.cos(angle);
        let z = radius * Math.sin(angle);

        // Top circle
        vertices.push(x, height / 2, z); // top circle vertex
        vertices.push(0, height / 2, 0); // top center vertex

        // Bottom circle
        vertices.push(x, -height / 2, z); // bottom circle vertex
        vertices.push(0, -height / 2, 0); // bottom center vertex
    }

    // Side walls of the cylinder
    for (let i = 0; i < numSegments; i++) {
        let angle = i * angleStep;
        let nextAngle = (i + 1) * angleStep;
        let x1 = radius * Math.cos(angle);
        let z1 = radius * Math.sin(angle);
        let x2 = radius * Math.cos(nextAngle);
        let z2 = radius * Math.sin(nextAngle);

        // Each quad on the side consists of two triangles
        vertices.push(x1, -height / 2, z1);
        vertices.push(x2, -height / 2, z2);
        vertices.push(x2, height / 2, z2);

        vertices.push(x1, -height / 2, z1);
        vertices.push(x2, height / 2, z2);
        vertices.push(x1, height / 2, z1);
    }

    // Create buffer, bind data and configure WebGL to use it
    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Set the color uniform
    let u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    gl.uniform4fv(u_FragColor, color);

    // Draw the cylinder
    // Draw top and bottom as fan, sides as individual triangles
    for (let i = 0; i < vertices.length / 3; i += 3) {
        gl.drawArrays(gl.TRIANGLES, i, 3);
    }
}
