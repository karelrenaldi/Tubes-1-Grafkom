import { GLHelper } from './utils/gl-helper';
import { GLObject } from './utils/gl-object';
import { ShaderUtil } from './utils/shader';
import { CanvasUtils } from './utils/canvas';

const main = async() : Promise<void> => {
    const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
    canvas.width = 900;
    canvas.height = 500;

    const gl = canvas.getContext('webgl2');
    if(!gl) {
        console.error("Your browser doesn't support webgl");
        return;
    }

    // Init shader program.
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

    let id = 0;
    canvas.addEventListener('mousedown', e => {
        const cu = new CanvasUtils(e, canvas);
        const { x, y } = cu.PixelCoorToGLCoor();
        
        const obj2 = new GLObject(id, shaderProgram, gl);
        obj2.SetVertex([x, y]);
        obj2.SetPosition(0, 0);
        obj2.SetRotation(0);
        obj2.SetScale(1, 1);
        obj2.SetColor(1, 0, 1, 1);

        glHelper.InsertObject(obj2);

        id++;
    });

    // glHelper.Run();
}

window.onload = main;