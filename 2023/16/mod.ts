import { loadFile, splitLines, timedSolution } from "../utils.ts";

type Coords = [x: number, y: number];
const directions = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
] as const;

function beam(
  grid: string[][],
  pos: Coords,
  dir: Coords,
  energised: Set<string>,
  visited: Set<string> = new Set<string>(),
) {
  const coordAndPathString = `${pos[0]},${pos[1]},${dir[0]},${dir[1]}`;
  if (visited.has(coordAndPathString)) {
    return;
  }
  visited.add(coordAndPathString);
  energised.add(`${pos[0]},${pos[1]}`);
  const next: Coords = [pos[0] + dir[0], pos[1] + dir[1]];
  if (
    next[0] < 0 || next[0] >= grid[0].length || next[1] < 0 ||
    next[1] >= grid.length
  ) {
    return;
  }
  const gridChar = grid[next[1]][next[0]];
  switch (gridChar) {
    case ".":
      beam(grid, next, dir, energised, visited);
      break;
    case "/":
      beam(grid, next, [dir[1] * -1, dir[0] * -1], energised, visited);
      break;

    case "b": // \
      beam(grid, next, [dir[1], dir[0]], energised, visited);
      break;
    case "-":
      if (dir[0] === 0) {
        beam(grid, next, [1, 0], energised, visited);
        beam(grid, next, [-1, 0], energised, visited);
      } else {
        beam(grid, next, dir, energised, visited);
      }
      break;
    case "|":
      if (dir[1] === 0) {
        beam(grid, next, [0, 1], energised, visited);
        beam(grid, next, [0, -1], energised, visited);
      } else {
        beam(grid, next, dir, energised, visited);
      }
      break;
  }
}

function paint(grid: string[][], energized: Set<string>) {
  for (let y = 0; y < grid.length; y++) {
    let line = "";
    for (let x = 0; x < grid[y].length; x++) {
      if (energized.has(`${x},${y}`)) {
        line += "#";
      } else {
        line += grid[y][x];
      }
    }
    console.log(line);
  }
}

await timedSolution(1, async () => {
  const energised = new Set<string>();
  const grid = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => line.replaceAll("\\", "b").split(""))
  );
  beam(grid, [-1, 0], [1, 0], energised, new Set());
  return energised.size - 1;
});
await timedSolution(1, async () => {
  const grid = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => line.replaceAll("\\", "b").split(""))
  );

  let max = -Infinity;
  for (let i = 0; i < grid.length; i++) {
    {
      // top
      const energized = new Set<string>();
      beam(grid, [i, -1], [0, 1], energized, new Set());
      max = Math.max(max, energized.size - 1);
    }
    {
      // right
      const energized = new Set<string>();
      beam(grid, [grid.length, i], [-1, 0], energized, new Set());
      max = Math.max(max, energized.size - 1);
    }
    {
      // bottom
      const energized = new Set<string>();
      beam(grid, [i, grid.length], [0, -1], energized, new Set());
      max = Math.max(max, energized.size - 1);
    }
    {
      // left
      const energized = new Set<string>();
      beam(grid, [-1, i], [1, 0], energized, new Set());
      max = Math.max(max, energized.size - 1);
    }
  }

  return max;
});
