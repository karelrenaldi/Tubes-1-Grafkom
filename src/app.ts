import { MatrixMult } from './utils/common';
import { ShaderUtil } from './utils/shader';

const main = async() : Promise<void> => {
    const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
    canvas.width = 800;
    canvas.height = 600;

    const gl = canvas.getContext('webgl2');
    if(!gl) {
        console.error("Your browser doesn't support webgl");
        return;
    }

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const vertices = [
        0.1, 0.1,
        1.0, 1.0,
        0.0, 1.0
    ];

    const [u, v] = [0, -0.5];
    const translateMatrix = [
        1, 0, 0,
        0, 1, 0,
        u, v, 1
    ]

    const theta = 270;
    const thetaInRadian = (2 * Math.PI) / 360 * theta;
    const sinTheta = Math.sin(thetaInRadian);
    const cosTheta = Math.cos(thetaInRadian);
    const rotationMatrix = [
        cosTheta, -sinTheta, 0,
        sinTheta, cosTheta, 0,
        0, 0, 1
    ]

    const [k1, k2] = [0.4, 0.4];
    const scaleMatrix = [
        k1, 0, 0,
        0, k2, 0,
        0, 0, 1
    ]

    const projectionMatrix = MatrixMult(MatrixMult(rotationMatrix, scaleMatrix), translateMatrix);

    // Create program.
    const shaderUtil = new ShaderUtil(
        gl,
        'vertex-shader-drawing.glsl',
        'fragment-shader-drawing.glsl'
    )
    const shaderProgram = await shaderUtil.CreateShaderProgram();
    if(shaderProgram === null) {
        console.error('Failed to create shader program');
        return;
    }

    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    gl.useProgram(shaderProgram);
    const vertexPos = gl.getAttribLocation(shaderProgram, "a_pos");
    const uniformPos = gl.getUniformLocation(shaderProgram, "u_proj_mat");
    const uniformCol = gl.getUniformLocation(shaderProgram, "u_fragColor");
    gl.vertexAttribPointer(vertexPos, 2, gl.FLOAT, false, 0, 0);
    gl.uniformMatrix3fv(uniformPos, false, projectionMatrix);
    gl.uniform4fv(uniformCol, [1.0, 0.0, 0.0, 1.0]);
    gl.enableVertexAttribArray(vertexPos);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length/2);
}

main();