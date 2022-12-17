import { Coord, directions } from "./Coord.ts";

const ROCK = "#";
const FALLING = "@";

export abstract class Shape {
  public points: Coord[] = [];
  public isFalling = true;
  constructor(public base: Coord) {
    this.adjustPointsForBase(base);
    return this;
  }
  abstract adjustPointsForBase(base: Coord): void;
  move(direction: keyof typeof directions) {
    if (!this.isFalling) return this.points;
    return this.points.map((p) => p.add(new Coord(...directions[direction])));
  }
  set(points: Coord[]) {
    this.points = points;
  }
  get char() {
    return this.isFalling ? FALLING : ROCK;
  }
  get heightBelowBase() {
    return Math.abs(
      Math.min(...this.points.map((p) => p.y)) - this.points[0].y
    );
  }
  get highestPoint() {
    return Math.max(...this.points.map((p) => p.y));
  }
}
export class LineVertical extends Shape {
  adjustPointsForBase(base: Coord) {
    this.points = [
      base,
      base.add(new Coord(0, -1)),
      base.add(new Coord(0, -2)),
      base.add(new Coord(0, -3)),
    ];
  }
}
export class LineHorizontal extends Shape {
  adjustPointsForBase(base: Coord) {
    this.points = [
      base,
      base.add(new Coord(1, 0)),
      base.add(new Coord(2, 0)),
      base.add(new Coord(3, 0)),
    ];
  }
}
export class Plus extends Shape {
  adjustPointsForBase(base: Coord): void {
    this.points = [
      base,
      base.add(new Coord(1, 0)),
      base.add(new Coord(2, 0)),
      base.add(new Coord(1, 1)),
      base.add(new Coord(1, -1)),
    ];
  }
}
export class InvertedL extends Shape {
  adjustPointsForBase(base: Coord): void {
    this.points = [
      base,
      base.add(new Coord(1, 0)),
      base.add(new Coord(2, 0)),
      base.add(new Coord(2, 1)),
      base.add(new Coord(2, 2)),
    ];
  }
}
export class Square extends Shape {
  adjustPointsForBase(base: Coord) {
    this.points = [
      base,
      base.add(new Coord(1, 0)),
      base.add(new Coord(0, 1)),
      base.add(new Coord(1, 1)),
    ];
  }
}
