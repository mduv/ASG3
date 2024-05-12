class Cube {
    constructor(color_list = [1, 0, 0, 1]) {
        this.type = 'cube';
        this.color = color_list;
        this.matrix = new Matrix4();
        this.textureNum = -2;

        this.verticies = new Float32Array([
            -0.5, -0.5, -0.5, 0, 0, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            0.5, 0.5, -0.5, 1, 1, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            0.5, -0.5, -0.5, 1, 0, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            -0.5, -0.5, -0.5, 0, 0, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            -0.5, 0.5, -0.5, 0, 1, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],
            0.5, 0.5, -0.5, 1, 1, this.color[0] * 1, this.color[1] * 1, this.color[2] * 1, this.color[3],

            -0.5, -0.5, 0.5, 0, 0, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            0.5, -0.5, 0.5, 1, 0, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            -0.5, -0.5, 0.5, 0, 0, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            -0.5, 0.5, 0.5, 0, 1, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],
            0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.8, this.color[1] * 0.8, this.color[2] * 0.8, this.color[3],

            -0.5, -0.5, -0.5, 0, 0, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, -0.5, 0.5, 1, 0, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, -0.5, -0.5, 0, 0, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, 0.5, -0.5, 0, 1, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],
            -0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.9, this.color[1] * 0.9, this.color[2] * 0.9, this.color[3],

            0.5, -0.5, -0.5, 0, 0, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, -0.5, 0.5, 1, 0, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, -0.5, -0.5, 0, 0, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, 0.5, -0.5, 0, 1, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],
            0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.7, this.color[1] * 0.7, this.color[2] * 0.7, this.color[3],

            -0.5, 0.5, -0.5, 0, 0, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            0.5, 0.5, -0.5, 1, 0, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            -0.5, 0.5, -0.5, 0, 0, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            -0.5, 0.5, 0.5, 0, 1, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],
            0.5, 0.5, 0.5, 1, 1, this.color[0] * 0.95, this.color[1] * 0.95, this.color[2] * 0.95, this.color[3],

            -0.5, -0.5, -0.5, 0, 0, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            0.5, -0.5, 0.5, 1, 1, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            0.5, -0.5, -0.5, 1, 0, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            -0.5, -0.5, -0.5, 0, 0, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            -0.5, -0.5, 0.5, 0, 1, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3],
            0.5, -0.5, 0.5, 1, 1, this.color[0] * 0.5, this.color[1] * 0.5, this.color[2] * 0.5, this.color[3]
        ]);
    }

    render() {
        drawCube(this.verticies, this.matrix, this.textureNum);
    }

};
var vertexBuffer = null;
function drawCube(verticies, matrix, texNum) {

    if (vertexBuffer == null) {
        initCubeBuffer();
    }

    gl.bufferData(gl.ARRAY_BUFFER, verticies, gl.STATIC_DRAW);
    gl.uniform1i(u_whichTexture, texNum);
    gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);

    gl.drawArrays(gl.TRIANGLES, 0, verticies.length / 9);
}

function initCubeBuffer() {

    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    let FLOAT_SIZE = Float32Array.BYTES_PER_ELEMENT;
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);


    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 9 * FLOAT_SIZE, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 9 * FLOAT_SIZE, 3 * FLOAT_SIZE);
    gl.enableVertexAttribArray(a_UV);

    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 9 * FLOAT_SIZE, 5 * FLOAT_SIZE);
    gl.enableVertexAttribArray(a_Color);
}