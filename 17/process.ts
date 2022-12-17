import { Coord, directions } from "./Coord.ts";
import { Plus } from "./shapes.ts";
import { Shape } from "./shapes.ts";
import { InvertedL } from "./shapes.ts";
import { LineHorizontal } from "./shapes.ts";
import { LineVertical } from "./shapes.ts";
import { Square } from "./shapes.ts";

const input = await Deno.readTextFile("input.txt");
/*
const input = await Deno.readTextFile("test.txt");
*/
const movements = input.split("").filter((c) => c in directions);

function* movementGenerator(): Generator<[number, string]> {
  let i = 0;
  while (true) {
    if (i < movements.length) {
      yield [i, movements[i]];
    } else {
      yield [i % movements.length, movements[i % movements.length]];
    }
    i++;
  }
}

function* shapeGenerator(): Generator<[number, Shape]> {
  let i = 0;
  while (true) {
    if (i % 5 === 0) {
      i = 0;
    }
    yield [i, new LineHorizontal(new Coord(0, 0))];
    yield [i, new Plus(new Coord(0, 0))];
    yield [i, new InvertedL(new Coord(0, 0))];
    yield [i, new LineVertical(new Coord(0, 0))];
    yield [i, new Square(new Coord(0, 0))];
    i++;
  }
}

class Grid {
  WIDTH = 7;
  ROCK_LIMIT = 22;

  heightIncreases: Array<{ prev: number; current: number }> = [];

  positionsSeen: Map<string, { rocks: number; height: number }> = new Map();

  rocksResting = 0;
  shapeGenerator = shapeGenerator();
  shapes: Array<Shape> = [];
  constructor(
    public skipToApproxRocks = 1800,
    public grid: Array<Array<string>> = []
  ) {}

  onRockResting(movementIndex: number) {
    // Add rock to rock counter
    this.rocksResting++;
    // Spawn a new shape and get its shape cycle index
    const shapeIndex = this.spawn();
    // Get the current height of the tower
    const towerHeight = this.towerHeight;
    // Get the delta from the top of the tower to the highest point of each column
    const columnHeightDelta = Array.from({ length: this.WIDTH }, (_, i) => {
      let columnHeight = this.ROCK_LIMIT * 2;
      const pointsInColumn = this.shapes
        .filter((s) => !s.isFalling)
        .map((s) => s.points.filter((p) => p.x === i))
        .flat();
      if (pointsInColumn.length) {
        columnHeight = Math.max(...pointsInColumn.map((p) => p.y));
      }
      return towerHeight - columnHeight;
    });
    // Generate a hash from column delta data, movment index and shape cycle index
    const hash = columnHeightDelta.join("") + movementIndex + shapeIndex;
    // Check if we have seen this hash before
    const seen = this.positionsSeen.get(hash);
    // We have!
    if (seen && this.rocksResting < this.skipToApproxRocks) {
      // Calculate the height and rock increase
      const rockIncrease = this.rocksResting - seen.rocks;
      const heightIncrease = towerHeight - seen.height;
      // Calculate how many times we need to repeat this cycle to get close to the target to skip to
      const times = Math.floor(
        (this.skipToApproxRocks - this.rocksResting) / rockIncrease
      );
      this.rocksResting += times * rockIncrease;
      this.shapes.forEach((s) =>
        s.points.forEach((p) => {
          p.y += heightIncrease * times;
        })
      );
      // We have not seen this hash before, let's store it
    } else {
      this.positionsSeen.set(hash, {
        rocks: this.rocksResting,
        height: towerHeight,
      });
    }
  }

  spawn() {
    const [shapeIndex, shape] = this.shapeGenerator.next().value;
    const highestPoint = Math.max(
      0,
      ...this.shapes.map((s) => s.highestPoint + 1)
    );

    const base = new Coord(2, highestPoint + 3 + shape.heightBelowBase);
    shape.adjustPointsForBase(base);
    this.shapes.unshift(shape);
    if (this.shapes.length > this.ROCK_LIMIT) {
      this.shapes = this.shapes.slice(0, this.ROCK_LIMIT);
    }
    return shapeIndex;
  }

  step(movmentIndex: number, movement: keyof typeof directions) {
    const s = this.shapes[0];
    const horizontalMovementPoints = s.move(movement);
    if (
      this.isMovementPossible(horizontalMovementPoints) &&
      !this.isIntersecting(horizontalMovementPoints)
    ) {
      s.set(horizontalMovementPoints);
    }

    const nextPoints = s.move("v");
    if (this.isIntersecting(nextPoints)) {
      s.isFalling = false;
      this.onRockResting(movmentIndex);
    } else {
      s.set(nextPoints);
    }
  }

  isMovementPossible(points: Coord[]) {
    return points.every((p) => p.y >= 0 && p.x >= 0 && p.x < this.WIDTH);
  }

  isIntersecting(points: Coord[]) {
    if (points.some((p) => p.y < 0)) return true;

    return this.shapes
      .slice(1)
      .find((s) => s.points.some((p) => points.some((p2) => p2.equals(p))));
  }

  draw() {
    const shapes = this.shapes;
    const highestPoint = Math.max(3, ...shapes.map((s) => s.highestPoint));
    for (let y = highestPoint; y >= Math.max(-1, highestPoint - 1000); y--) {
      const row = [];
      if (y === -1) {
        row.push(...Array(this.WIDTH).fill("-"));
        console.log(row.join(""));
        continue;
      }
      for (let x = 0; x < this.WIDTH; x++) {
        const point = new Coord(x, y);
        const shape = shapes.find((s) => s.points.some((p) => p.equals(point)));
        row.push(shape ? shape.char : ".");
      }
      console.log(row.join("") + " " + y);
    }
  }
  get towerHeight() {
    return Math.max(
      0,
      ...this.shapes.filter((s) => !s.isFalling).map((s) => s.highestPoint + 1)
    );
  }
}

const part1 = () => {
  const targetRocks = 2022;
  const grid = new Grid();
  const movmentIterator = movementGenerator();
  grid.spawn();
  while (grid.rocksResting < targetRocks) {
    const movement = movmentIterator.next().value as [number, string];
    grid.step(...movement);
  }
  return grid.towerHeight;
};
const part2 = () => {
  const targetRocks = 1000000000000;
  const grid = new Grid(targetRocks - 1000);
  const movementIterator = movementGenerator();
  grid.spawn();
  while (grid.rocksResting < 1000000000000) {
    grid.step(...(movementIterator.next().value as [number, string]));
  }
  return grid.towerHeight;
};

console.time("part1");
console.log(part1());
console.timeEnd("part1");
console.time("part2");
console.log(part2());
console.timeEnd("part2");
