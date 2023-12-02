export class Coord {
  constructor(public x: number, public y: number) {}
  add(coord: Coord) {
    return new Coord(this.x + coord.x, this.y + coord.y);
  }
  toString() {
    return `${this.x},${this.y}`;
  }
  equals(coord: Coord) {
    return this.x === coord.x && this.y === coord.y;
  }
}

export const directions: Record<string, [number, number]> = {
  "<": [-1, 0],
  ">": [1, 0],
  "^": [0, 1],
  v: [0, -1],
};
