export type VectorNumber = Array<number>;
export type VectorNumber2 = [number, number];
export type VectorNumber4 = [number, number, number, number];
export type AppData = {
    id: number;
    type: ShapeType;
    rotation: number;
    scale: Array<number>;
    position: Array<number>;
    color: Array<number>;
    vertex: Array<number>;
}

export enum AppState {
    DRAW,
    MOVE,
    COLOR,
    ROTATE,
    SCALE,
}

export enum ShapeType {
    LINE,
    SQUARE,
    RECTANGLE,
    POLYGON,
    POINT
}