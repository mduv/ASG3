// blockyAnimal.js
// Vertex shader program

var VSHADER_SOURCE = `
    precision mediump float;
    attribute vec4 a_Position;
    attribute vec2 a_UV;
    varying vec2 v_UV;

    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    uniform mat4 u_ViewMatrix;
    uniform mat4 u_ProjectionMatrix;

    void main(){
        gl_Position =  u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
        v_UV = a_UV;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform int u_whichTexture;
    void main(){

      if(u_whichTexture == -2){
        gl_FragColor = u_FragColor;  

      } else if (u_whichTexture == -1){
        gl_FragColor = vec4(v_UV, 1.0, 1.0);

      } else if (u_whichTexture == 0){
        gl_FragColor = texture2D(u_Sampler0, v_UV);

      } else{
        gl_FragColor = vec4(1, .2, .2, 1);
      }

    }`

// Global Variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_Sampler0;
let u_whichTexture;


function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }
    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Fail to get the storage location of a_Position');
        return;
    }
    a_UV = gl.getAttribLocation(gl.program, 'a_UV');
    if (a_UV < 0) {
        console.log('Fail to get the storage location of a_UV');
        return;
    }
    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Fail to get the storage location of u_FragColor');
        return;
    }
    u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    if (!u_ModelMatrix) {
        console.log('Fail to get the storage location of u_ModelMatrix');
        return;
    }
    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Fail to get the storage location of u_GlobalRotateMatrix');
        return;
    }
    var u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
    if (!u_Sampler0) {
        console.log('Fail to get the storage location of u_Sampler');
        return;
    }
    u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Fail to get the storage location of u_ViewMatrix');
        return;
    }
    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Fail to get the storage location of u_ProjectionMatrix');
        return;
    }
    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Fail to get the storage location of u_whichTexture');
        return;
    }
    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
}



function initTextures() {
    var image = new Image(); 
    if (!image) {
        console.log('Fail to create the image object');
        return false;
    }
    image.onload = function () { sendTextureToGLSL(image); };
    image.src = 'sky.jpg';
    return true;
}

function sendTextureToGLSL(image) {
    var texture = gl.createTexture(); // Create a texture object
    if (!texture) {
        console.log('Fail to creaye texture object');
        return false;
    }

    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
    // Enable the texture unit 0
    gl.activeTexture(gl.TEXTURE0);
    // Bind the texture object to the target
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // Set the texture image
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

    // Set the texture unit 0 to the sampler
    gl.uniform1i(u_Sampler0, 0);

    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw a rectangle

    console.log('finished loadTexture');
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//globals related to UI elements
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]; //white starting
let g_selectedSize = 5;
let g_selectedType = POINT;
let circle_seg = 10;

let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;

let g_yellowAnimation = false;
let g_magentaAnimation = false;


//set up actions for HTML UI elements
function addActionsForHtmlUI() {
    document.getElementById('animationYellowOnButton').addEventListener('mousemove', function () { g_yellowAnimation = true });
    document.getElementById('animationYellowOffButton').addEventListener('mousemove', function () { g_yellowAnimation = false });

    document.getElementById('animationMagentaOnButton').addEventListener('mousemove', function () { g_magentaAnimation = true });
    document.getElementById('animationMagentaOffButton').addEventListener('mousemove', function () { g_magentaAnimation = false });

    //size slider events
    document.getElementById('yellowSlide').addEventListener('mousemove', function () { g_yellowAngle = this.value; renderAllShapes(); });
    document.getElementById('magentaSlide').addEventListener('mousemove', function () { g_magentaAngle = this.value; renderAllShapes(); });
    document.getElementById('angleSlide').addEventListener('mousemove', function () { g_globalAngle = this.value; renderAllShapes(); });
}


function main() {

    setupWebGL();

    connectVariablesToGSL();

    console.log('Which Texture:', u_whichTexture);

    addActionsForHtmlUI();

    document.onkeydown = keydown;

    initTextures();



    // Set the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // renderAllShapes();

    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
    g_seconds = performance.now() / 1000.0 - g_startTime;
    // console.log(g_seconds);

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

var g_shapesList = [];

function click(ev) {
    //extract the event click and return it in WebGL coordinates
    // let can see in local vars, or just type in the var in console to see same thing
    [x, y] = convertCoordinatesEventToGL(ev);

    // create and store the new point
    let point;
    if (g_selectedType == POINT) {
        point = new Point();
    } else if (g_selectedType == TRIANGLE) {
        point = new Triangle();
    }
    else {
        point = new Circle(circle_seg);
    }

    point.position = [x, y];
    point.color = g_selectedColor.slice();
    point.size = g_selectedSize;
    g_shapesList.push(point);

    //Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2)

    return ([x, y]);
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (45 * Math.sin(g_seconds));
    }
    if (g_magentaAnimation) {
        g_magentaAngle = (45 * Math.sin(3 * g_seconds));
    }
}

function keydown(ev) {
    if (ev.keyCode == 37) { //right arrow
        g_eye[0] += 0.2;
    } else if (ev.keyCode == 39) { //left arrow
        g_eye[0] -= 0.2;
    } else if (ev.keyCode == 38) { //up ar
        g_eye[2] -= 0.2;
    } else if (ev.keyCode == 40) { //down ar
        g_eye[2] += 0.2;
    }

    renderAllShapes();
    console.log(ev.keyCode);
}


var g_eye = [0, 0, 3];
var g_at = [0, 0, -100];
var g_up = [0, 1, 0];


function renderAllShapes() {
    // Check the time at the start of this function
    var startTime = performance.now();

    var projMat = new Matrix4();
    projMat.setPerspective(50, 1 * canvas.width / canvas.height, 1, 100);
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

    var viewMat = new Matrix4();
    viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // drawMap();


    // ground
    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.textureNum = 0;
    body.matrix.translate(0, -0.75, 0.0);
    body.matrix.scale(10, 0, 10);
    body.matrix.translate(-.5, 0, -.5);
    body.render();

    // sky
    var sky = new Cube();
    sky.color = [1.0, 0.0, 0.0, 1.0];
    sky.textureNum = 0;
    sky.matrix.scale(50, 50, 50);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();


    var body = new Cube();
    body.color = [1.0, 0.0, 0.0, 1.0];
    body.textureNum = -2; // color
    body.matrix.translate(-.25, -.75, 0.0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, .3, .5);
    body.render();

    var leftArm = new Cube();
    leftArm.color = [1, 1, 0, 1];
    leftArm.textureNum = 0; // color
    leftArm.matrix.setTranslate(0, -.5, 0.0);
    leftArm.matrix.rotate(-5, 1, 0, 1);
    leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);

    var yellowCoordinatesMat = new Matrix4(leftArm.matrix);
    leftArm.matrix.scale(0.25, .7, .5);
    leftArm.matrix.translate(-.5, 0, 0);
    leftArm.render();

    var box = new Cube();
    box.color = [1, 0, 1, 1];
    box.textureNum = -1;
    box.matrix = yellowCoordinatesMat;
    box.matrix.translate(0, 0.65, 0);
    box.matrix.rotate(g_magentaAngle, 0, 0, 1);
    box.matrix.scale(.3, .3, .3);
    box.matrix.translate(-.5, 0, -0.001);
    box.render();

    //check time at end of function, show on pg
    var duration = performance.now() - startTime;
    sendTextToHTML("numdot: ms: " + Math.floor(duration) + " fps: " + Math.floor(10000 / duration) / 10, "numdot");

}

// set the text of a HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElm = document.getElementById(htmlID);
    if (!htmlElm) {
        // console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}