import { AppData, ShapeType } from '../types/type';
import { GLObject } from './gl-object';

interface IGLHelper {
    RemovePoints(): void;
    RenderAllObject(): void;
    GetObjectsData(): Array<AppData>;
    RemoveObject(idObj: number) : void;
    InsertObject(newObj: GLObject) : void;
}

export class GLHelper implements IGLHelper {
    public Objects : Array<GLObject>;
    public Total : number;

    private gl : WebGL2RenderingContext;

    constructor(gl : WebGL2RenderingContext) {
        this.Objects = new Array<GLObject>();
        this.Total = 0;
        this.gl = gl;
    }

    public InsertObject(newObj: GLObject) : void { 
        this.Objects.push(newObj); 
        ++this.Total; 
    }

    public RemoveObject(idObj: number) : void {
        const idxObject = this.Objects.findIndex(o => o.id === idObj);
        this.Objects.splice(idxObject, 1);
        --this.Total;
    }

    public RenderAllObject() : void {
        for(const obj of this.Objects) {
            obj.BindVertices();
            obj.DrawVertices();
        };
    }

    public RemovePoints(): void {
        this.Objects = this.Objects.filter((obj) => obj.type !== ShapeType.POINT);
    }

    public GetObjectsData(): Array<AppData> {
        const objectsData = [];
        for(const object of this.Objects) {
            objectsData.push(object.GetData());
        }
        return objectsData;
    }
}