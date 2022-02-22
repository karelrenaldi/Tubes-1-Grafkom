import { GLObject } from '../utils/gl-object';

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