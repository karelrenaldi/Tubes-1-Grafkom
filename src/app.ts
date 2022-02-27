import {
    COLOR, DEFAULT_COLOR, DEFAULT_POSITION, DEFAULT_ROTATION, DEFAULT_SCALE, DRAW, LINE, MOVE,
    POLYGON, RECTANGLE, SQUARE
} from './constant';
import { AppData, AppState, ShapeType } from './types/type';
import { CanvasUtils } from './utils/canvas';
import {
    CreateRandomString,
    DownloadFile,
    EuclidianDistance, HexToRGBA, IsPointInPolygon, IsPointInRectSquare
} from './utils/common';
import { GLHelper } from './utils/gl-helper';
import { GLObject } from './utils/gl-object';
import { ShaderUtil } from './utils/shader';

let appState : AppState = AppState.DRAW;
let shapeState : ShapeType = ShapeType.POINT;
let currentVerticesShapeLeft : number = 0;
let currentVerticesShape : Array<number> = [];
let currentColor : Array<number> = [...DEFAULT_COLOR];
let currentShapePrimitive : GLenum = 0;
let isMouseClick : boolean = false;
let loadFileInput : HTMLInputElement | null;

const main = async() : Promise<void> => {
    const okButton = document.querySelector('.ok-button') as HTMLButtonElement;
    const shapeSelect = document.querySelector('#shape-tools') as HTMLSelectElement;
    const actionSelect = document.querySelector('#action-tools') as HTMLSelectElement;
    const polygonNumSideInput = document.querySelector('#polygon-num-sides') as HTMLInputElement;
    const colorInput = document.querySelector('#color-picker') as HTMLInputElement;
    const loadInput = document.querySelector('#load-input') as HTMLInputElement;
    const saveButton = document.querySelector('#save-button') as HTMLButtonElement;

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
        
        glHelper.RenderAllObject();
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    canvas.addEventListener('mousedown', e => {
        const cu = new CanvasUtils(e, canvas);
        const { x, y } = cu.PixelCoorToGLCoor();

        if(appState === AppState.DRAW) {
            --currentVerticesShapeLeft;
            currentVerticesShape = [...currentVerticesShape, x, y];

            if(currentVerticesShapeLeft === 0) {
                handleDrawShape();
            } else {
                handleDrawPoint(x, y);
            }
        } else if(appState === AppState.MOVE) {
            isMouseClick = true;
        } else if(appState === AppState.COLOR) {
            handleColorShape(x, y);
        }
    });

    canvas.addEventListener('mouseup', e => {
        if(appState === AppState.MOVE) {
            isMouseClick = false;
        }
    })

    canvas.addEventListener('mousemove', e => {
        if(appState !== AppState.MOVE || isMouseClick !== true) return;

        const cu = new CanvasUtils(e, canvas);
        const distanceThreshold = 0.09;
        const { x, y } = cu.PixelCoorToGLCoor();

        let objectClickedId = -1;
        let objectPointClickedIdx = [-1, -1];
        let isFoundObjectClicked = false;
        glHelper.Objects.forEach((obj) => {
            const currObjVertex = obj.vertex;
            if(obj.type === ShapeType.LINE && currObjVertex.length === 4) {
                for(let i = 0; i < obj.vertex.length; i += 2) {
                    const distance = EuclidianDistance(
                        [currObjVertex[i], currObjVertex[i + 1]], 
                        [x, y]
                    );
                    if (distance <= distanceThreshold) {
                        objectClickedId = obj.id;
                        objectPointClickedIdx = [i, i + 1];
                        isFoundObjectClicked = true;
                    }
                }
            }
        });

        if(objectClickedId !== -1 && !objectPointClickedIdx.includes(-1) && isFoundObjectClicked) {
            const clickedObject = glHelper.Objects.find((obj) => obj.id === objectClickedId);
            if (clickedObject) {
                if(clickedObject.type === ShapeType.LINE) {
                    clickedObject.vertex[objectPointClickedIdx[0]] = x;
                    clickedObject.vertex[objectPointClickedIdx[1]] = y;
                }
            }
        }
    });

    okButton.addEventListener('click', () => {
        const action = actionSelect.value;
        if(action === DRAW) {
            appState = AppState.DRAW;
            refreshDrawState();
            if(shapeState === ShapeType.POLYGON && polygonNumSideInput.value) {
                currentVerticesShapeLeft = Number(polygonNumSideInput.value);
            }
        } else if (action === COLOR) {
            appState = AppState.COLOR
        } else if (action === MOVE) {
            appState = AppState.MOVE
        }
    });

    colorInput.addEventListener('change', (e) => {
        const currColor = HexToRGBA(colorInput.value);
        currentColor = [currColor[0], currColor[1], currColor[2], currColor[3]];
    });

    saveButton.addEventListener('click', () => handleSave());
    loadInput.addEventListener('change', (e) => handleLoad(e));

    const refreshDrawState = () => {
        const shape = shapeSelect.value;
        switch(shape) {
            case LINE:
                shapeState = ShapeType.LINE;
                currentVerticesShapeLeft = 2;
                currentShapePrimitive = gl.LINES;
                break;
            case SQUARE:
                shapeState = ShapeType.SQUARE;
                currentVerticesShapeLeft = 2;
                currentShapePrimitive = gl.TRIANGLES;
                break;
            case RECTANGLE:
                shapeState = ShapeType.RECTANGLE;
                currentVerticesShapeLeft = 2;
                currentShapePrimitive = gl.TRIANGLES;
                break;
            case POLYGON:
                shapeState = ShapeType.POLYGON;
                currentVerticesShapeLeft = Number(polygonNumSideInput.value);
                currentShapePrimitive = gl.TRIANGLE_FAN;
                break;
            default:
                return;
        }

        currentVerticesShape = [];
        glHelper.RemovePoints();
    }

    const handleDrawShape = () => {
        const newObj = new GLObject(
            glHelper.Total, 
            shaderProgram, 
            gl, 
            currentShapePrimitive,
            shapeState
        );

        if(shapeState === ShapeType.LINE) {
            newObj.SetVertex(currentVerticesShape);
        } else if (shapeState === ShapeType.RECTANGLE) {
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
        } else if(shapeState === ShapeType.POLYGON) {
            newObj.SetVertex(currentVerticesShape);
        }

        newObj.SetPosition(DEFAULT_POSITION[0], DEFAULT_POSITION[1]);
        newObj.SetRotation(DEFAULT_ROTATION);
        newObj.SetScale(DEFAULT_SCALE[0], DEFAULT_SCALE[1]);
        newObj.SetColor(currentColor[0], currentColor[1], currentColor[2], currentColor[3]);

        glHelper.InsertObject(newObj);
        refreshDrawState();
    }

    const handleDrawPoint = (x: number, y: number) => {
        const newObj = new GLObject(
            glHelper.Total,
            shaderProgram,
            gl,
            gl.POINTS,
            ShapeType.POINT
        )
        newObj.SetVertex([x, y]);
        newObj.SetPosition(DEFAULT_POSITION[0], DEFAULT_POSITION[1]);
        newObj.SetRotation(DEFAULT_ROTATION);
        newObj.SetScale(DEFAULT_SCALE[0], DEFAULT_SCALE[1]);
        newObj.SetColor(currentColor[0], currentColor[1], currentColor[2], currentColor[3]);

        glHelper.InsertObject(newObj);
    }

    const handleColorShape = (x: number, y: number) => {
        const currColor = HexToRGBA(colorInput.value);

        const objects = glHelper.Objects;

        let selectedObject;
        for(const object of objects) {
            if(
                (object.type === ShapeType.SQUARE || object.type === ShapeType.RECTANGLE) 
                && IsPointInRectSquare([x, y], object.vertex)
            ) {
                selectedObject = object;
                break;
            }

            if(object.type === ShapeType.POLYGON && IsPointInPolygon([x, y], object.vertex)) {
                selectedObject = object;
                break;
            }
        }

        selectedObject && selectedObject.SetColor(
            currColor[0], 
            currColor[1], 
            currColor[2], 
            currColor[3]
        );
    }

    const handleSave = () => {
        refreshDrawState();

        const fileData = {createdAt: new Date(), data: glHelper.GetObjectsData()};
        const fileName = `${CreateRandomString(30)}.json`;
        const fileType = "application/json"

        DownloadFile(JSON.stringify(fileData), fileName, fileType);
    }

    const handleLoad = (e: Event) => {
        const files = (<HTMLInputElement>e.target).files as FileList
        if (!files) return;

        const reader = new FileReader();
        reader.onload = function (e: ProgressEvent<FileReader>) {
            const rs = e.target?.result;
            const data = JSON.parse(rs as string).data as Array<AppData>;

            for(const datum of data) {
                let currPrimitive = gl.TRIANGLES;
                if(datum.type === ShapeType.LINE) currPrimitive = gl.LINES;
                if(datum.type === ShapeType.POLYGON) currPrimitive = gl.TRIANGLE_FAN;

                const newObj = new GLObject(
                    glHelper.Total,
                    shaderProgram,
                    gl,
                    currPrimitive,
                    datum.type,
                )
                newObj.SetVertex(datum.vertex);
                newObj.SetPosition(datum.position[0], datum.position[1]);
                newObj.SetRotation(datum.rotation);
                newObj.SetScale(datum.scale[0], datum.scale[1]);
                newObj.SetColor(datum.color[0], datum.color[1], datum.color[2], datum.color[3]);
        
                glHelper.InsertObject(newObj);
            }
        };

        reader.readAsText(files[0]);
    }
}

main();