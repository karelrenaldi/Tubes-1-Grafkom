import { MatrixMult } from './common';
import { VectorNumber, VectorNumber2, VectorNumber4 } from '../types/type';

interface IGLObject {
  DrawVertices() : void;
  BindVertices() : void;
  SetRotation(theta: number): void;
  SetVertex(vertex: VectorNumber): void;
  SetScale(k1: number, k2: number): void;
  SetPosition(x: number, y: number): void;
  SetColor(red: number, green: number, blue: number, alpha: number): void;
}

export class GLObject implements IGLObject {
  public id: number;
  public rotation: number;
  public scale: VectorNumber2;
  public position: VectorNumber2;
  public color: VectorNumber4;
  public vertex: VectorNumber;
  public projectionMatrix: VectorNumber;

  private primitive : GLenum;
  private shaderProgram: WebGLProgram;
  private gl: WebGL2RenderingContext;

  constructor(
    id: number,
    shaderProgram: WebGLProgram,
    gl: WebGL2RenderingContext,
    primitive: GLenum
  ) {
    this.id = id;

    this.rotation = 0;
    this.scale = [1, 1];
    this.position = [0, 0];

    this.color = [1, 0, 0, 1];

    this.vertex = [];
    this.projectionMatrix = [];

    this.shaderProgram = shaderProgram;
    this.gl = gl;
    this.primitive = primitive;
  }

  public SetColor(red: number, green: number, blue: number, alpha: number): void {
    this.color = [red, green, blue, alpha];
  }

  public SetVertex(vertex: VectorNumber): void {
    this.vertex = vertex;
  }

  public SetPosition(x: number, y: number): void {
    this.position = [x, y];
    
    const newProjectionMatrix = this.generateProjectionMatrix();
    if(newProjectionMatrix) this.projectionMatrix = newProjectionMatrix;
  }

  public SetRotation(theta: number): void {
    this.rotation = theta;

    const newProjectionMatrix = this.generateProjectionMatrix();
    if(newProjectionMatrix) this.projectionMatrix = newProjectionMatrix;
  }

  public SetScale(k1: number, k2: number): void {
    this.scale = [k1, k2];

    const newProjectionMatrix = this.generateProjectionMatrix();
    if(newProjectionMatrix) this.projectionMatrix = newProjectionMatrix;
  }

  public BindVertices() : void {
    const vertexBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertex), this.gl.STATIC_DRAW);
  }

  public DrawVertices() : void {
    this.gl.useProgram(this.shaderProgram);
    
    const vertexPos = this.gl.getAttribLocation(this.shaderProgram, 'a_pos');
    const uniformPos = this.gl.getUniformLocation(this.shaderProgram, 'u_proj_mat');
    const uniformCol = this.gl.getUniformLocation(this.shaderProgram, 'u_fragColor');

    this.gl.vertexAttribPointer(vertexPos, 2, this.gl.FLOAT, false, 0, 0);
    this.gl.uniformMatrix3fv(uniformPos, false, this.projectionMatrix);
    this.gl.uniform4fv(uniformCol, this.color);
    this.gl.enableVertexAttribArray(vertexPos);
    this.gl.drawArrays(this.primitive, 0, this.vertex.length / 2);
  }

  private generateProjectionMatrix(): VectorNumber | null {
    if (this.position == null || this.rotation == null || this.scale == null) return null;

    // Generate translation matrix.
    const [u, v] = this.position;
    const matrixTranslate = [
      1, 0, 0, 
      0, 1, 0, 
      u, v, 1
    ];

    // Generate rotation matrix.
    const theta = this.rotation;
    const thetaInRadian = (2 * Math.PI) / 360 * theta;
    const sinTheta = Math.sin(thetaInRadian);
    const cosTheta = Math.cos(thetaInRadian);
    const matrixRotation = [
      cosTheta, -sinTheta, 0,
      sinTheta, cosTheta, 0,
      0, 0, 1
    ]

    // Generate scale matrix.
    const [k1, k2] = this.scale;
    const matrixScale = [
      k1, 0, 0,
      0, k2, 0,
      0, 0, 1
    ]

    return MatrixMult(MatrixMult(matrixRotation, matrixScale), matrixTranslate);
  }
}
