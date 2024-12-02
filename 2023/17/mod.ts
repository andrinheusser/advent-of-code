import { loadFile, splitLines, timedSolution } from "../../utils/utils.ts";

type Direction = 0 | 1 | 2 | 3;

class Coords {
  constructor(public readonly x: number, public readonly y: number) {}
  toString() {
    return `${this.x},${this.y}`;
  }
  toTuple() {
    return [this.x, this.y];
  }
  nextInDirection(direction: Direction, steps: number) {
    switch (direction) {
      case 0:
        return new Coords(this.x, this.y - steps);
      case 1:
        return new Coords(this.x + steps, this.y);
      case 2:
        return new Coords(this.x, this.y + steps);
      case 3:
        return new Coords(this.x - steps, this.y);
    }
  }
  nextLeftRight(direction: Direction) {
    switch (direction) {
      case 0:
        return [new Coords(this.x - 1, this.y), new Coords(this.x + 1, this.y)];
      case 1:
        return [new Coords(this.x, this.y - 1), new Coords(this.x, this.y + 1)];
      case 2:
        return [new Coords(this.x + 1, this.y), new Coords(this.x - 1, this.y)];
      case 3:
        return [new Coords(this.x, this.y + 1), new Coords(this.x, this.y - 1)];
    }
  }
  equals(other: Coords) {
    return this.x === other.x && this.y === other.y;
  }
  isInBounds(grid: Grid) {
    if (this.x < 0 || this.y < 0) return false;
    if (this.y >= grid.length) return false;
    if (this.x >= grid[this.y].length) return false;
    return true;
  }
}

type State = {
  heatLoss: number;
  current: Coords;
  previousStraightSteps: number;
  previousDirection: Direction;
  path: Coords[];
};

class Queue<State extends { heatLoss: number }> {
  private queue: State[] = [];
  public insert(node: State) {
    const { heatLoss } = node;
    const index = this.queue.findIndex((n) => n.heatLoss < heatLoss);
    if (index === -1) {
      this.queue.push(node);
    } else {
      this.queue.splice(index, 0, node);
    }
  }
  public next() {
    return this.queue.pop();
  }
  public get length() {
    return this.queue.length;
  }
  public hasNext() {
    return this.queue.length > 0;
  }
}

type Grid = Array<Array<number>>;

function paint(grid: Grid, path: Coords[]) {
  for (let y = 0; y < grid.length; y++) {
    let line = "";
    for (let x = 0; x < grid[y].length; x++) {
      line += path.find((p) => p.equals(new Coords(x, y))) ? "." : grid[y][x];
    }
    console.log(line);
  }
}

const findPath = (
  grid: Grid,
  start: Coords,
  end: Coords,
  { canTurn, mustTurn }: {
    canTurn: (previousStraightSteps: number) => boolean;
    mustTurn: (previousStraightSteps: number) => boolean;
  },
): number => {
  const queue = new Queue<State>();
  queue.insert({
    current: start,
    heatLoss: 0,
    previousStraightSteps: 0,
    previousDirection: 1,
    path: [],
  });

  const visited = new Set<string>();

  while (queue.hasNext()) {
    const {
      current,
      heatLoss,
      previousStraightSteps,
      previousDirection,
      path,
    } = queue.next()!;

    const visitedKey =
      `${current.toString()},${previousDirection},${previousStraightSteps}`;

    if (!visited.has(visitedKey)) {
      if (current.equals(end) && canTurn(previousStraightSteps)) {
        paint(grid, path);
        return heatLoss;
      }

      visited.add(visitedKey);

      if (!mustTurn(previousStraightSteps)) {
        const next = current.nextInDirection(
          previousDirection,
          1,
        );
        if (next.isInBounds(grid)) {
          queue.insert({
            current: next,
            heatLoss: heatLoss + grid[next.y][next.x],
            previousStraightSteps: previousStraightSteps + 1,
            previousDirection,
            path: [...path, next],
          });
        }
      }
      if (canTurn(previousStraightSteps)) {
        const [left, right] = current.nextLeftRight(previousDirection);
        if (left.isInBounds(grid)) {
          queue.insert({
            current: left,
            heatLoss: heatLoss + grid[left.y][left.x],
            previousStraightSteps: 0,
            previousDirection: (previousDirection + 3) % 4 as Direction,
            path: [...path, left],
          });
        }
        if (right.isInBounds(grid)) {
          queue.insert({
            current: right,
            heatLoss: heatLoss + grid[right.y][right.x],
            previousStraightSteps: 0,
            previousDirection: (previousDirection + 1) % 4 as Direction,
            path: [...path, right],
          });
        }
      }
    }
  }
  throw new Error("No path found");
};

await timedSolution(1, async () => {
  const grid: Grid = await loadFile(true).then(splitLines).then((lines) => {
    return lines.map((line) =>
      line.split("").map((n) => {
        return +n;
      })
    );
  });

  return findPath(
    grid,
    new Coords(0, 0),
    new Coords(grid[0].length - 1, grid.length - 1),
    {
      canTurn: (_previousStraightSteps) => true,
      mustTurn: (previousStraightSteps) => previousStraightSteps === 2,
    },
  );
});
await timedSolution(2, async () => {
  const grid: Grid = await loadFile(true).then(splitLines).then((lines) => {
    return lines.map((line) =>
      line.split("").map((n) => {
        return +n;
      })
    );
  });

  return findPath(
    grid,
    new Coords(0, 0),
    new Coords(grid[0].length - 1, grid.length - 1),
    {
      canTurn: (previousStraightSteps) => previousStraightSteps > 2,
      mustTurn: (previousStraightSteps) => previousStraightSteps === 9,
    },
  );
});
