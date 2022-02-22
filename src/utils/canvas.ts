export class CanvasUtils {
    private event : MouseEvent;
    private canvas : HTMLCanvasElement;

    constructor(event : MouseEvent, canvas: HTMLCanvasElement) {
        this.event = event;
        this.canvas = canvas;
    }

    public PixelCoorToGLCoor() : { x : number, y: number } {
        const x = this.event.clientX;
        const y = this.event.clientY;

        const midX = this.canvas.width / 2;
        const midY = this.canvas.height / 2;

        const r = this.canvas.getBoundingClientRect();

        const newX = ((x - r.left) - midX) / midX;
        const newY = (midY - (y - r.top)) / midY;

        return { x: newX, y: newY }
    }
}