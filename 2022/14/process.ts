const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

type GridPoint = { x: number; y: number; char: GridChar };
type GridChar = "." | "#" | "O" | "+";
type GridLine = Array<{ x: number; y: number }>;

const SANDX = 500;
const SANDY = 0;

function inputLineToGridLines(line: string) {
  const matches = line.split(" -> ").map((l) =>
    l.match(/(\d+,\d+)/)![0].split(",").map(Number)
  );
  return matches.map(([x, y]) => ({ x, y }));
}

function* windowGenerator<T extends Array<unknown>>(
  inputArray: T,
  size: number,
) {
  for (let index = 0; index + size <= inputArray.length; index++) {
    yield inputArray.slice(index, index + size);
  }
}

function* linesToGridPoints(lines: GridLine): Generator<GridPoint> {
  for (
    const [one, two] of windowGenerator<GridLine>(lines, 2) as Generator<
      GridLine
    >
  ) {
    const { x: x1, y: y1 } = one;
    const { x: x2, y: y2 } = two;
    const xmin = Math.min(x1, x2);
    const xmax = Math.max(x1, x2);
    const ymin = Math.min(y1, y2);
    const ymax = Math.max(y1, y2);
    for (let x = xmin; x <= xmax; x++) {
      for (let y = ymin; y <= ymax; y++) {
        yield { x, y, char: "#" };
      }
    }
  }
}

class Grid {
  public sandProduced = 0;
  public sandOutOfBounds = false;
  public points: GridPoint[];
  public lastSandPath: GridPoint[] = [];
  constructor() {
    this.points = [{ x: SANDX, y: SANDY, char: "+" }];
  }
  public parseGridLines(lines: GridLine) {
    for (const point of linesToGridPoints(lines)) {
      this.points.push(point);
    }
  }
  public addPoint(point: GridPoint) {
    this.points.push(point);
  }
  public get minX() {
    return Math.min(...this.points.map((n) => n.x));
  }
  public get maxX() {
    return Math.max(...this.points.map((n) => n.x));
  }
  public get minY() {
    return Math.min(...this.points.map((n) => n.y));
  }
  public get maxY() {
    return Math.max(
      ...this.points.filter((p) => p.char === "#").map((n) => n.y),
    );
  }
  public get width() {
    return this.maxX - this.minX + 1;
  }
  public get height() {
    return this.maxY - this.minY + 1;
  }
  private isFree(x: number, y: number) {
    const point = this.points.find((p) => p.x === x && p.y === y);
    if (point) {
      return false;
    }
    if (y > this.maxY + 1) {
      return false;
    }

    return true;
  }
  private getNextSandPosition(sand: GridPoint): GridPoint | null | undefined {
    const { x, y } = sand;
    const down = this.isFree(x, y + 1);
    if (down) {
      return { x, y: y + 1, char: "O" };
    }
    const downLeft = this.isFree(x - 1, y + 1);
    if (downLeft) {
      return { x: x - 1, y: y + 1, char: "O" };
    }
    const downRight = this.isFree(x + 1, y + 1);
    if (downRight) {
      return { x: x + 1, y: y + 1, char: "O" };
    }
    return null;
  }
  public print() {
    for (let y = 0; y <= this.maxY + 1; y++) {
      let line = "";
      for (let x = this.minX; x <= this.maxX; x++) {
        const point = this.points.find((p) => p.x === x && p.y === y);
        if (point) {
          line += point.char;
        } else {
          line += ".";
        }
      }
      console.log(line);
    }
  }
  public produceSand() {
    this.sandProduced++;
    let sand: GridPoint = { x: SANDX, y: SANDY, char: "O" };

    if (this.lastSandPath.length > 0) {
      for (const point of this.lastSandPath.reverse()) {
        if (this.getNextSandPosition(point)) {
          sand = point;
          break;
        }
      }
    }

    const path = [];
    path.push(sand);

    let nextPosition = this.getNextSandPosition(sand);
    if (!nextPosition) {
      throw new Error("No next position after " + (this.sandProduced));
    }
    let previousPosition: GridPoint | null = null;

    while (nextPosition) {
      previousPosition = nextPosition;
      path.push(previousPosition);
      nextPosition = this.getNextSandPosition(nextPosition);
    }
    this.lastSandPath = path;

    this.addPoint(previousPosition!);
  }
}

const gridLines = lines.map((line) => inputLineToGridLines(line));
const grid = new Grid();
for (const line of gridLines) {
  grid.parseGridLines(line);
}

try {
  do {
    grid.produceSand();
  } while (true);
} catch (e) {
  console.log(e.message);
}
