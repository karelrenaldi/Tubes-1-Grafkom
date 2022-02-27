export type VectorNumber = Array<number>;
export type VectorNumber2 = [number, number];
export type VectorNumber4 = [number, number, number, number];

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