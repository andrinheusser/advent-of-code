import { timedSolution } from "../../utils/utils.ts";

type Coords = [number, number];
type Cell = string;
type Grid = Cell[][];
type BorderLocation = "upper" | "lower" | "left" | "right";

function markRegion(grid: Grid, current: Coords, visited: Set<string>) {
  const stack = [current];
  let fences: number = 0;
  let area = 0;
  const sides: {
    coords: Coords;
    direction: BorderLocation;
  }[] = [];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);
    area += 1;

    [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ].forEach(([nx, ny], index) => {
      const n =
        nx >= 0 && nx < grid[0].length && ny >= 0 && ny < grid.length
          ? grid[ny][nx]
          : null;
      if (n && n === grid[y][x]) {
        stack.push([nx, ny]);
      } else {
        sides.push({
          coords: [x, y],
          direction:
            index === 0
              ? "right"
              : index === 1
              ? "left"
              : index === 2
              ? "lower"
              : "upper",
        });
        fences += 1;
      }
    });
  }

  const s = sides.reduce<{ coords: Coords; directions: BorderLocation[] }[]>(
    (acc, side) => {
      const found = acc.find((a) => isSame(a.coords, side.coords));
      if (found) {
        found.directions.push(side.direction);
      } else {
        acc.push({ coords: side.coords, directions: [side.direction] });
      }
      return acc;
    },
    []
  );

  return { area, fences, sides: getSides(s) };
}

function getSides(
  input: { coords: Coords; directions: BorderLocation[] }[]
): number {
  let sum = 0;
  while (true) {
    const current = input.find((a) => a.directions.length > 0);
    if (!current) return sum;
    const direction = current?.directions[0];

    const possibleNext = input.filter(
      (f) =>
        f.directions.includes(direction) &&
        (direction === "upper" || direction === "lower"
          ? f.coords[1] === current.coords[1]
          : f.coords[0] === current.coords[0])
    );

    let nextPositive = true,
      nextNegative = true,
      step = 1;
    while (nextPositive || nextNegative) {
      const nextP =
        nextPositive &&
        possibleNext.find((f) =>
          direction === "upper" || direction === "lower"
            ? f.coords[0] === current.coords[0] + step &&
              f.coords[1] === current.coords[1]
            : f.coords[1] === current.coords[1] + step &&
              f.coords[0] === current.coords[0]
        );
      const nextN =
        nextNegative &&
        possibleNext.find((f) =>
          direction === "upper" || direction === "lower"
            ? f.coords[0] === current.coords[0] - step &&
              f.coords[1] === current.coords[1]
            : f.coords[1] === current.coords[1] - step &&
              f.coords[0] === current.coords[0]
        );

      if (!nextP) {
        nextPositive = false;
      } else {
        nextP.directions = nextP.directions.filter((a) => a !== direction);
      }

      if (!nextN) {
        nextNegative = false;
      } else {
        nextN.directions = nextN.directions.filter((a) => a !== direction);
      }

      step += 1;
    }
    sum += 1;
    current.directions = current.directions.filter((a) => a !== direction);
  }
}

function isSame(a: Coords, b: Coords) {
  return a[0] === b[0] && a[1] === b[1];
}

await timedSolution(1, async () => {
  let sum = 0;

  const input: Cell[][] = await Deno.readTextFile("input.txt").then((result) =>
    result.split("\n").map((line) => line.split(""))
  );

  const visited = new Set<string>();

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        const { area, fences } = markRegion(input, [x, y], visited);

        sum += area * fences;
      }
    }
  }
  return sum;
});

await timedSolution(2, async () => {
  let sum = 0;

  const input: Cell[][] = await Deno.readTextFile("input.txt").then((result) =>
    result.split("\n").map((line) => line.split(""))
  );

  const visited = new Set<string>();

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input[y].length; x++) {
      const key = `${x},${y}`;
      if (!visited.has(key)) {
        const { area, sides } = markRegion(input, [x, y], visited);

        sum += area * sides;
      }
    }
  }
  return sum;
});
