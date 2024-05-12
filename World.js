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

var FSHADER_SOURCE = `
precision mediump float;

varying vec4 v_Color;
varying vec2 v_UV;

uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;


uniform int u_whichTexture;

void main() {
    
    if(u_whichTexture == -2) {
        gl_FragColor =  v_Color;

    } else if(u_whichTexture == -1) {
        gl_FragColor = vec4(v_UV,1.0,1.0);

    } else if(u_whichTexture == 1) {
        gl_FragColor = texture2D(u_Sampler1, v_UV);

    }else if(u_whichTexture == 2) {
        gl_FragColor = texture2D(u_Sampler2, v_UV);

    }else if(u_whichTexture == 3) {
        gl_FragColor = texture2D(u_Sampler3, v_UV);

    } else {
        gl_FragColor = vec4(1,.2,.2,1);

    }
}`;

let canvas;         
let gl;             
let a_Position;     
let a_Color;
let a_UV;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;


let u_ModelMatrix;    
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_whichTexture;


let g_ShapesList = [];

let camera;

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    gl.clearColor(0, 0, 0, 1);
    initTextures();
    camera = new Camera();
    document.onkeydown = keydown;
    document.onmousemove = mouseMove;

}

function setupWebGL() {
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

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return;
    }

    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Failed to get the storage location of a_UV');
        return;
    }

    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Failed to get the storage location of u_ModelMatrix');
        return;
    }


    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage location of u_ViewMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get the storage location of u_ProjectionMatrix');
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
    var image1 = new Image();
    var image2 = new Image();
    var image3 = new Image();  
    

    if (!image1 || !image2 || !image3) {
        console.log('Failed to create the image object');
        return false;
    }

    image1.onload = function () { loadTexture(image1, u_Sampler1, 1); };
    image1.src = "sky1.jpg";

    image2.onload = function () { loadTexture(image2, u_Sampler2, 2); };
    image2.src = "dry2.jpeg";

    image3.onload = function () { loadTexture(image3, u_Sampler3, 3); };
    image3.src = "bush.jpeg";

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
        case 1:
            gl.activeTexture(gl.TEXTURE1);
            break;
        case 2:
            gl.activeTexture(gl.TEXTURE2);
            break;
        case 3:
            gl.activeTexture(gl.TEXTURE3);
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

