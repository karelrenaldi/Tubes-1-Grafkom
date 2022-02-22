import { GLObject } from './gl-object';

interface IGLHelper {
    RenderAllObject() : void;
    RemoveObject(idObj: number) : void;
    InsertObject(newObj: GLObject) : void;
}

export class GLHelper implements IGLHelper {
    public Objects : Array<GLObject>;
    public Total : number;

    constructor() {
        this.Objects = new Array<GLObject>();
        this.Total = 0;
    }

    public Run() : void {
        requestAnimationFrame(this.RenderAllObject.bind(this));
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
        requestAnimationFrame(this.RenderAllObject.bind(this));
    }
}