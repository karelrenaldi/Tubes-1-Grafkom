import { DEFAULT_COLOR, DEFAULT_POSITION, DEFAULT_ROTATION, DEFAULT_SCALE, DRAW, LINE, MOVE, POLYGON, RECTANGLE, SELECT, SQUARE } from './constant';
import { AppState, ShapeState } from './types/type';
import { CanvasUtils } from './utils/canvas';
import { GLHelper } from './utils/gl-helper';
import { GLObject } from './utils/gl-object';
import { ShaderUtil } from './utils/shader';

let appState : AppState = AppState.DRAW;
let shapeState : ShapeState | null = null;
let currentVerticesShapeLeft : number = 0;
let currentVerticesShape : Array<number> = [];
let currentShapePrimitive : GLenum = 0;

const main = async() : Promise<void> => {
    const okButton = document.querySelector('.ok-button') as HTMLButtonElement;
    const shapeSelect = document.querySelector('#shape-tools') as HTMLSelectElement;
    const actionSelect = document.querySelector('#action-tools') as HTMLSelectElement;

    const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
    canvas.width = 700;
    canvas.height = 500;

    const gl = canvas.getContext('webgl2');
    if(!gl) {
        console.error("Your browser doesn't support webgl");
        return;
    }

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

    const glHelper = new GLHelper(gl);
    const render = () => {
        gl.clearColor(1, 1, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (appState === AppState.DRAW) {
            let currentPrimitive = gl.LINES;
            if (shapeState === ShapeState.POLYGON) {
                currentPrimitive = gl.LINE_STRIP;
            }

            const newObj = new GLObject(
                glHelper.Total + 1, 
                shaderProgram, 
                gl, 
                currentPrimitive
            );
    
            newObj.SetVertex(currentVerticesShape);
            newObj.SetPosition(DEFAULT_POSITION[0], DEFAULT_POSITION[1]);
            newObj.SetRotation(DEFAULT_ROTATION);
            newObj.SetScale(DEFAULT_SCALE[0], DEFAULT_SCALE[1]);
            newObj.SetColor(DEFAULT_COLOR[0], DEFAULT_COLOR[1], DEFAULT_COLOR[2], DEFAULT_COLOR[3]);
            newObj.BindVertices();
            newObj.DrawVertices();
        }
        glHelper.RenderAllObject();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    canvas.addEventListener('mousedown', e => {
        if (appState === AppState.DRAW) {
            const cu = new CanvasUtils(e, canvas);
            const { x, y } = cu.PixelCoorToGLCoor();

            --currentVerticesShapeLeft;
            currentVerticesShape = [...currentVerticesShape, x, y];

            if(currentVerticesShapeLeft === 0) {
                handleDrawShape();
            }
        }
    });

    okButton.addEventListener('click', () => {
        const action = actionSelect.value;
        if(action === DRAW) {
            appState = AppState.DRAW;
            refreshDrawState();
        } else if (action === SELECT) {
            appState = AppState.SELECT
        } else if (action === MOVE) {
            appState = AppState.MOVE
        }
    })

    const refreshDrawState = () => {
        const shape = shapeSelect.value;
        switch(shape) {
            case LINE:
                shapeState = ShapeState.LINE;
                currentVerticesShapeLeft = 2;
                currentShapePrimitive = gl.LINES;
                break;
            case SQUARE:
                shapeState = ShapeState.SQUARE;
                currentVerticesShapeLeft = 2;
                currentShapePrimitive = gl.TRIANGLES;
                break;
            case RECTANGLE:
                shapeState = ShapeState.RECTANGLE;
                currentVerticesShapeLeft = 4;
                currentShapePrimitive = gl.TRIANGLES;
                break;
            case POLYGON:
                shapeState = ShapeState.POLYGON;
                currentVerticesShapeLeft = 999;
                currentShapePrimitive = gl.TRIANGLES;
                break;
            default:
                return;
        }
        currentVerticesShape = [];
    }

    const handleDrawShape = () => {
        const newObj = new GLObject(
            glHelper.Total, 
            shaderProgram, 
            gl, 
            currentShapePrimitive
        );

        if(shapeState === ShapeState.LINE) {
            newObj.SetVertex(currentVerticesShape);
        } else if (shapeState === ShapeState.RECTANGLE) {
            const deltaX = currentVerticesShape[2] - currentVerticesShape[0]
            const deltaY = currentVerticesShape[3] - currentVerticesShape[1]
            const squareVerticesShape = [
                currentVerticesShape[0], currentVerticesShape[1],
                currentVerticesShape[0], currentVerticesShape[1] + deltaY,
                currentVerticesShape[2], currentVerticesShape[3],
                currentVerticesShape[2], currentVerticesShape[3],
                currentVerticesShape[0] + deltaX, currentVerticesShape[1],
                currentVerticesShape[0], currentVerticesShape[1],
            ]; 
            newObj.SetVertex(squareVerticesShape);
        }
        // TODO: Lanjutin buat 2 bentuk lagi.

        newObj.SetPosition(DEFAULT_POSITION[0], DEFAULT_POSITION[1]);
        newObj.SetRotation(DEFAULT_ROTATION);
        newObj.SetScale(DEFAULT_SCALE[0], DEFAULT_SCALE[1]);
        newObj.SetColor(DEFAULT_COLOR[0], DEFAULT_COLOR[1], DEFAULT_COLOR[2], DEFAULT_COLOR[3]);

        glHelper.InsertObject(newObj);
        refreshDrawState();
    }
}

main();