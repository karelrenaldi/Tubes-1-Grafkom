interface IShaderUtil {
  CreateShaderProgram: () => Promise<WebGLProgram | null>;
}

export class ShaderUtil implements IShaderUtil {
  private gl: WebGL2RenderingContext;
  private vertexSource: string;
  private fragmentSource: string;

  constructor(
    gl: WebGL2RenderingContext,
    vertexSource: string,
    fragmentSource: string
  ) {
    this.gl = gl;
    this.vertexSource = vertexSource;
    this.fragmentSource = fragmentSource;
  }

  public async CreateShaderProgram(): Promise<WebGLProgram | null> {
    const vertShader = await this.createShader(
      this.gl.VERTEX_SHADER,
      this.vertexSource
    );
    if (vertShader === null) return null;

    const fragShader = await this.createShader(
      this.gl.FRAGMENT_SHADER,
      this.fragmentSource
    );
    if (fragShader === null) return null;

    const shaderProgram = this.gl.createProgram();
    if (!shaderProgram) return null;

    this.gl.attachShader(shaderProgram, vertShader);
    this.gl.attachShader(shaderProgram, fragShader);
    this.gl.linkProgram(shaderProgram);

    const isSuccess = this.gl.getProgramParameter(
      shaderProgram,
      this.gl.LINK_STATUS
    );
    if (isSuccess) return shaderProgram;

    console.error("Failed link shader program");
    this.gl.deleteProgram(shaderProgram);

    return null;
  }

  private async createShader(
    type: number,
    source: string
  ): Promise<WebGLShader | null> {
    const shader = this.gl.createShader(type);
    if (!shader) return null;

    const rawShader = await this.getRawShader(source);
    this.gl.shaderSource(shader, rawShader);
    this.gl.compileShader(shader);

    const isSuccess = this.gl.getShaderParameter(
      shader,
      this.gl.COMPILE_STATUS
    );
    if (isSuccess) return shader;

    console.error("Failed compile shader");
    this.gl.deleteShader(shader);

    return null;
  }

  private async getRawShader(source: string): Promise<string> {
    const res = await fetch(`/shaders/${source}`);
    const rawShader = await res.text();

    return rawShader;
  }
}
