export enum Direction {
  North = 0,
  East = 1,
  South = 2,
  West = 3,
}

export class Coords {
  constructor(public x: number, public y: number) {}
  equals(other: Coords) {
    this.x === other.x && this.y === other.y;
  }
  add(other: Coords) {
    return new Coords(this.x + other.x, this.y + other.y);
  }
  step(direction: Direction, steps = 1) {
    switch (direction) {
      case Direction.North:
        return new Coords(this.x, this.y - steps);
      case Direction.East:
        return new Coords(this.x + steps, this.y);
      case Direction.South:
        return new Coords(this.x, this.y + steps);
      case Direction.West:
        return new Coords(this.x - steps, this.y);
    }
  }
  manhattanDistance(other: Coords) {
    return Math.abs(this.x - other.x) + Math.abs(this.y - other.y);
  }
  neighbors() {
    return [
      this.add(new Coords(0, 1)),
      this.add(new Coords(1, 0)),
      this.add(new Coords(0, -1)),
      this.add(new Coords(-1, 0)),
    ];
  }
  validNeighbors(validate: (coords: Coords) => boolean) {
    return this.neighbors().filter(validate);
  }
  static from(x: number, y: number) {
    return new Coords(x, y);
  }
  static toString(coords: Coords) {
    return `${coords.x},${coords.y}`;
  }
  toString() {
    return Coords.toString(this);
  }
  static fromString(s: string) {
    const [x, y] = s.split(",").map(Number);
    return new Coords(x, y);
  }
  clamp(gridCols: number, gridRows: number) {
    return new Coords(this.x % gridCols, this.y % gridRows);
  }
}

export class Grid<T extends string | number> {
  constructor(public grid: Array<Array<T>>) {
    this.grid = grid;
  }
}
