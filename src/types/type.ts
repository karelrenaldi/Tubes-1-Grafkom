export type VectorNumber = Array<number>;
export type VectorNumber2 = [number, number];
export type VectorNumber4 = [number, number, number, number];

export enum AppState {
    DRAW,
    SELECT,
    MOVE,
    ROTATE,
    SCALE
}

export enum ShapeState {
    LINE,
    SQUARE,
    RECTANGLE,
    POLYGON
}