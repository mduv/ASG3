var VSHADER_SOURCE = `
precision mediump float;

attribute vec4 a_Position;
attribute vec4 a_Color;
attribute vec2 a_UV;

varying vec4 v_Color;
varying vec2 v_UV;

uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;

void main() {
    v_Color = a_Color;
    v_UV = a_UV;
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
}`;

// Fragment shader program
var FSHADER_SOURCE = `
precision mediump float;

varying vec4 v_Color;
varying vec2 v_UV;

uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform sampler2D u_Sampler5;
uniform sampler2D u_Sampler6;
uniform sampler2D u_Sampler7;
uniform int u_whichTexture;

void main() {
    
    if(u_whichTexture == -2) {
        gl_FragColor =  v_Color;

    } else if(u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV,1.0,1.0);

    } else if(u_whichTexture == 0) {
        gl_FragColor = texture2D(u_Sampler0, v_UV);

    }else if(u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);

    }else if(u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);

    }else if(u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);

    }else if(u_whichTexture == 4) {
        gl_FragColor = texture2D(u_Sampler4, v_UV);

    }else if(u_whichTexture == 5) {
        gl_FragColor = texture2D(u_Sampler5, v_UV);

    }else if(u_whichTexture == 6) {
        gl_FragColor = texture2D(u_Sampler6, v_UV);

    }else if(u_whichTexture == 7) {
        gl_FragColor = texture2D(u_Sampler7, v_UV);

    } else {
        gl_FragColor = vec4(1,.2,.2,1);

    }
}`;

// All Global Variables Here
let canvas;         
let gl;             
let a_Position;     
let a_Color;
let a_UV;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_Sampler5;
let u_Sampler6;
let u_Sampler7;

let u_ModelMatrix;    
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;


let g_ShapesList = [];

let camera;

function main() {

    // Create canvas and setup WebGL
    setUpCanvas();

    // Initialize Shaders for WEBGL
    initAllShaders();

    // Register function (event handler) to be called on a mouse press
    setUpAllEvents();

    // Specify the color for clearing <canvas>
    gl.clearColor(0, 0, 0, 1);
    initTextures();
    camera = new Camera();
    document.onkeydown = keydown;

    // // Clear <canvas>
    document.onmousemove = mouseMove;

}

// Initialize Canvas/WebGl to start
function setUpCanvas() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl" || "experimental-webgl", { preserveDrawingBuffer: true });
    gl.enable(gl.BLEND)
    gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE,
        gl.ONE_MINUS_SRC_ALPHA);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

// Initialize shaders and all variables for GLSL
function initAllShaders() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // // Get the storage location of a_Position
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    // Get the storage location of a_Color
    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    // Get the storage location of a_UV
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    // Get the storage location of u_ModelMatrix
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }


    // Get the storage location of u_ViewMatrix
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    // Get the storage location of u_ProjectionMatrix
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
        return;
    }

    u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Failed to get the storage location of u_Sampler0');
        return;
    }

    u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
    if (!u_Sampler1) {
        console.log('Failed to get the storage location of u_Sampler1');
        return;
    }

    u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
    if (!u_Sampler2) {
        console.log('Failed to get the storage location of u_Sampler2');
        return;
    }

    u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
    if (!u_Sampler3) {
        console.log('Failed to get the storage location of u_Sampler3');
        return;
    }

    u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
    if (!u_Sampler4) {
        console.log('Failed to get the storage location of u_Sampler4');
        return;
    }

    u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
    if (!u_Sampler5) {
        console.log('Failed to get the storage location of u_Sampler5');
        return;
    }

    u_Sampler6 = gl.getUniformLocation(gl.program, 'u_Sampler6');
    if (!u_Sampler6) {
        console.log('Failed to get the storage location of u_Sampler6');
        return;
    }

    u_Sampler7 = gl.getUniformLocation(gl.program, 'u_Sampler7');
    if (!u_Sampler7) {
        console.log('Failed to get the storage location of u_Sampler7');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get the storage location of u_whichTexture');
        return;
    }


    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);

}

// All UI actions will be connected here.
function setUpAllEvents() {
}

let lastX = 0;
let lastY = 0;
function mouseMove(ev) {
    if (ev.buttons == 1) {
        camera.pan(-ev.movementX, -ev.movementY);
        renderAllShapes();
    }
}

function addBlock() {
    // Calculate the map square in front of the camera
    let cameraPos = camera.getPosition();
    let cameraDir = camera.getDirection();
    let blockPos = calculateBlockInFront(cameraPos, cameraDir);

    // Add a new block at the calculated position
    let newBlock = new Cube();
    newBlock.textureNum = 3;
    newBlock.matrix.translate(blockPos[0], blockPos[1], blockPos[2]);
    worldBlocks.push(newBlock);

    // Re-render the scene to reflect the changes
    renderAllShapes();
}

function deleteBlock() {
    // Calculate the map square in front of the camera
    let cameraPos = camera.getPosition();
    let cameraDir = camera.getDirection();
    let blockPos = calculateBlockInFront(cameraPos, cameraDir);

    // Find and remove any block at the calculated position
    for (let i = 0; i < worldBlocks.length; ++i) {
        let block = worldBlocks[i];
        if (block.matrix.elements[12] === blockPos[0] && block.matrix.elements[13] === blockPos[1] && block.matrix.elements[14] === blockPos[2]) {
            worldBlocks.splice(i, 1);
            break;
        }
    }

    // Re-render the scene to reflect the changes
    renderAllShapes();
}

function calculateBlockInFront(cameraPos, cameraDir) {
    // Calculate the position of the map square directly in front of the camera
    let blockPos = [
        Math.round(cameraPos[0] + cameraDir[0]),
        Math.round(cameraPos[1] + cameraDir[1]),
        Math.round(cameraPos[2] + cameraDir[2])
    ];
    return blockPos;
}

function keydown(ev) {
    switch (ev.keyCode) {
        case 65:
            camera.moveLeft();
            break;
        case 68:
            camera.moveRight();
            break;
        case 87:
            camera.moveForward();
            break;
        case 83:
            camera.moveBackward();
            break;
        case 81:
            camera.panLeft();
            break;
        case 69:
            camera.panRight();
            break;
        case 32:
            // go up
            addBlock();
            // camera.moveUp();
            break;
        case 16:
            // go down
            deleteBlock();
            //camera.moveDown();
            break;
        default:
            break;
    }
    renderAllShapes();
}

function coordsToWebGL(ev) {
    var x = ev.clientX; 
    var y = ev.clientY; 
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}


function renderAllShapes() {

    // Clear <canvas>
    let startTime = performance.now();
    let projMat = camera.projectionMatrix;
    let viewMat = camera.viewMatrix;

    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    drawBase();
    drawMap();

}

function tick() {
    renderAllShapes();
    requestAnimationFrame(tick);
}

function sendTextToHTML(text, id) {
    obj = document.getElementById(id);
    if (!obj) {
        return;
    }
    obj.innerHTML = text;
}


function initTextures() {
    // var image0 = new Image();  // Create the image object
    var image1 = new Image();
    var image2 = new Image();
    var image3 = new Image();  // Create the image object
    // var image4 = new Image();
    // var image5 = new Image();
    // var image6 = new Image();
    // var image7 = new Image();

    if (!image1 || !image2 || !image3) {
        console.log('Failed to create the image object');
        return false;
    }
    // image0.onload = function () { loadTexture(image0, u_Sampler0, 0); };
    // image0.src = "./images/dirt.png";

    image1.onload = function () { loadTexture(image1, u_Sampler1, 1); };
    image1.src = "./images/sky1.jpg";

    image2.onload = function () { loadTexture(image2, u_Sampler2, 2); };
    image2.src = "./images/dry2.jpeg";

    image3.onload = function () { loadTexture(image3, u_Sampler3, 3); };
    image3.src = "./images/bush.jpeg";

    // image4.onload = function () { loadTexture(image4, u_Sampler4, 4); };
    // image4.src = "./images/maze.png";

    // image5.onload = function () { loadTexture(image5, u_Sampler5, 5); };
    // image5.src = "./images/dirt.png";

    // image6.onload = function () { loadTexture(image6, u_Sampler6, 6); };
    // image6.src = "./images/dirt.png";

    // image7.onload = function () { loadTexture(image7, u_Sampler7, 7); };
    // image7.src = "./images/maze.png";

    return true;
}
var tex1 = false;
function loadTexture(image, sampler, texUnit = 0) {
    let texture = gl.createTexture();   // Create a texture object

    if (!texture) {
        console.log('Failed to create the texture object');
        return false;
    }
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable texture unit0
    switch (texUnit) {
        case 0:
            gl.activeTexture(gl.TEXTURE0);
            break;
        case 1:
            gl.activeTexture(gl.TEXTURE1);
            break;
        case 2:
            gl.activeTexture(gl.TEXTURE2);
            break;
        case 3:
            gl.activeTexture(gl.TEXTURE3);
            break;
        case 4:
            gl.activeTexture(gl.TEXTURE4);
            break;
        case 5:
            gl.activeTexture(gl.TEXTURE5);
            break;
        case 6:
            gl.activeTexture(gl.TEXTURE6);
            break;
        case 7:
            gl.activeTexture(gl.TEXTURE7);
            break;
        default:
            gl.activeTexture(gl.TEXTURE8);
            break;
    }
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(sampler, texUnit);
    renderAllShapes();
}

let g_map = [
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,],
    [4, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 3, 0, 0, 3, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 3, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 0, 0, 0, 3, 3, 3, 3, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 0, 0, 0, 3, 0, 0, 3, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 2, 2, 2, 2, 2, 2, 0, 0, 2, 0, 4,],
    [4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 2, 2, 2, 2, 0, 0, 2, 2, 2, 0, 4,],
    [4, 0, 0, 3, 3, 3, 3, 0, 0, 3, 3, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 2, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 2, 3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 3, 2, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 2, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 2, 2, 2, 0, 0, 2, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 2, 2, 2, 2, 2, 2, 2, 2, 2, 0, 0, 3, 0, 2, 0, 0, 0, 0, 2, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 3, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 4,],
    [4, 0, 0, 3, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 3, 0, 2, 0, 0, 0, 2, 0, 0, 0, 0, 4,],
    [4, 3, 3, 3, 0, 0, 3, 3, 3, 2, 2, 2, 2, 2, 2, 0, 0, 2, 3, 3, 3, 3, 3, 0, 0, 0, 2, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 3, 3, 3, 0, 2, 2, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 4,],
    [4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 4, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 4,],
    [4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 0, 0, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,],
];


let worldBlocks = [];
let baseBlocks = [];
function createMap() {
    for (let x = 0; x < 32; ++x) {
        for (let y = 0; y < 32; ++y) {
            if (g_map[y][x] != 0) {
                if (g_map[y][x] == 4) {
                    var block = new Cube();
                    block.textureNum = 3;
                    block.matrix.translate(y - 15.5, 1.25, x - 15.5);
                    block.matrix.scale(1, 4, 1);
                    worldBlocks.push(block);
                    continue;
                }
                if (g_map[y][x] == 3) {
                    var block = new Cube();
                    block.textureNum = 3;
                    block.matrix.translate(y - 15.5, .75, x - 15.5);
                    block.matrix.scale(1, 3, 1);
                    worldBlocks.push(block);
                    continue;
                }
                for (let i = 0; i < g_map[y][x]; ++i) {
                    var block = new Cube();
                    block.textureNum = 3;
                    block.matrix.translate(y - 15.5, i - .25, x - 15.5);
                    worldBlocks.push(block);
                }

            }
        }
    }
}

function drawMap() {
    if (worldBlocks.length == 0) {
        createMap();
    }
    for (let i = 0; i < worldBlocks.length; ++i) {
        worldBlocks[i].render();
    }
}

function drawBase() {
    if (baseBlocks.length == 0) {
        generateBase();
    }
    for (let i = 0; i < baseBlocks.length; ++i) {
        baseBlocks[i].render();
    }
}

function generateBase() {
    let ground = new Cube();
    ground.textureNum = 2;
    ground.matrix.translate(0, -.755, 0);
    ground.matrix.scale(64, 0.02, 64);
    ground.matrix.rotate(90, 0, 1, 0);
    ground.render();
    baseBlocks.push(ground);

    let sky = new Cube();
    sky.textureNum = 1;
    sky.matrix.scale(1000, 1000, 1000);
    sky.render();
    baseBlocks.push(sky);
}

