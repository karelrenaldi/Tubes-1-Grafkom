interface IGLObject {
}

class GLObject implements IGLObject {
    public Id : number;
    public Rotation : number;
    public Scale : [number, number];
    public Position : [number, number];
    public Vertex : Array<number>;
    public ProjectionMatrix : Array<number>;

    private shaderProgram : WebGLProgram;
    private gl : WebGL2RenderingContext;

    constructor(id : number, shaderProgram : WebGLProgram, gl : WebGL2RenderingContext) {
        this.Id = id;
        this.shaderProgram = shaderProgram;
        this.gl = gl;

        this.Rotation = 0;
        this.Scale = [1, 1];
        this.Position = [0, 0];

        this.Vertex = [];
        this.ProjectionMatrix = [];
    }

    public SetVertex(vertex : Array<number>) { this.Vertex = vertex; }
    
    public SetPosition(x: number, y: number) { 
        this.Position = [x, y]; 
        this.ProjectionMatrix = [1];
    }

    public SetRotation(theta: number) { this.Rotation = theta; }

    public SetScale(k1: number, k2: number) { this.Scale = [k1, k2]; }
}