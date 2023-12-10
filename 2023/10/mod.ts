import { loadFile, splitLines, timedSolution } from "../utils.ts";

type Coord = [x: number, y: number];

const NORTH: Coord = [0, -1];
const SOUTH: Coord = [0, 1];
const EAST: Coord = [1, 0];
const WEST: Coord = [-1, 0];
const PIPES: Record<string, Coord[]> = {
  "|": [NORTH, SOUTH],
  "-": [EAST, WEST],
  "L": [NORTH, EAST],
  "J": [NORTH, WEST],
  "7": [SOUTH, WEST],
  "F": [SOUTH, EAST],
  ".": [],
};

const reverse = (d: Coord) => d.map((v) => v === 0 ? 0 : -v) as Coord;

const nextStep = (
  grid: string[][],
  current: Coord,
  direction: Coord,
): { next: Coord; direction: Coord } => {
  const [nx, ny] = current.map((v, i) => v + direction[i]) as Coord;
  const next = grid[ny]?.[nx];
  const backwards = reverse(direction);
  if (next === "." || next === "S") throw new Error("No next step");
  const nextDirection =
    PIPES[next].filter((d) =>
      !(backwards[0] === d[0] && backwards[1] === d[1])
    )[0];
  return { next: [nx, ny], direction: nextDirection };
};

await timedSolution(1, async () => {
  let start: Coord = [0, 0];
  const grid = await loadFile(true).then(splitLines).then(
    (lines) =>
      lines.map((line, y) => {
        const hasStart = line.indexOf("S") !== -1;
        if (hasStart) start = [line.indexOf("S"), y];
        return line.split("");
      }),
  );
  let finsihed = false;
  let length = 0;
  let next = { next: start, direction: SOUTH };
  do {
    try {
      length++;
      next = nextStep(grid, next.next, next.direction);
    } catch (_e) {
      finsihed = true;
    }
  } while (!finsihed);
  return length / 2;
});

await timedSolution(2, async () => {
  let start: Coord = [0, 0];
  const grid = await loadFile(true).then(splitLines).then(
    (lines) =>
      lines.map((line, y) => {
        const hasStart = line.indexOf("S") !== -1;
        if (hasStart) start = [line.indexOf("S"), y];
        return line.split("").map(
          (c) => ({ c, loop: false }),
        );
      }),
  );
  const pureGrid = grid.map((l) => l.map((cell) => cell.c));
  let finsihed = false;
  let length = 0;
  let next = { next: start, direction: SOUTH };
  do {
    try {
      length++;
      grid[next.next[1]][next.next[0]].loop = true;
      next = nextStep(
        pureGrid,
        next.next,
        next.direction,
      );
    } catch (_e) {
      finsihed = true;
    }
  } while (!finsihed);
  let area = 0;
  let insideLoop = false;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const { loop, c } = grid[y][x];
      if (loop && ["|", "J", "L"].includes(c)) {
        insideLoop = !insideLoop;
      }
      area = insideLoop && !loop ? area + 1 : area;
    }
  }
  return area;
});
