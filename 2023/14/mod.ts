import {
  loadFile,
  rotate2DGridEast,
  splitLines,
  timedSolution,
} from "../utils.ts";

function paint(grid: string[][]) {
  console.log(
    "____________________GRID ",
    grid.length,
    grid[0].length,
    "____________________",
  );
  console.log(grid.map((line) => line.join("")).join("\n"));
  console.log("____________________GRID____________________");
}

function move(grid: string[][]) {
  let score = 0;
  for (let y = grid.length - 1; y >= 0; y--) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "O") {
        let obstacleY = -1, moveRocks = 1;
        for (let oY = y - 1; oY >= 0; oY--) {
          if (grid[oY][x] === "#") {
            obstacleY = oY;
            break;
          } else if (grid[oY][x] === "O") {
            moveRocks++;
          }
        }
        for (let oY = obstacleY + 1; oY <= y; oY++) {
          if (moveRocks > 0) {
            grid[oY][x] = "O";
            moveRocks--;
          } else {
            grid[oY][x] = ".";
          }
        }
      }
      if (grid[y][x] === "O") {
        score += grid.length - y;
      }
    }
  }
  return score;
}

function score(grid: string[][]) {
  let score = 0;
  for (let y = grid.length - 1; y >= 0; y--) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "O") {
        score += grid.length - y;
      }
    }
  }
  return score;
}

await timedSolution(1, async () => {
  const grid = await loadFile(true).then(splitLines).then((lines) =>
    lines.map((line) => line.split(""))
  );
  const score = move(grid);
  return score;
});

await timedSolution(2, async () => {
  const debug = false;
  const grid = await loadFile(!debug).then(splitLines).then((lines) =>
    lines.map((line) => line.split(""))
  );
  const TARGETCYCLES = 1000000000;
  const moveAndRotate = (grid: string[][]) =>
    move(grid) && rotate2DGridEast(grid);
  const detected = {
    startIndex: debug ? 9 : 190,
    length: debug ? 7 : 14,
    values: [] as number[],
  };
  const cycle = (grid: string[][], times = 1) => {
    for (let i = 0; i < times; i++) {
      for (let j = 0; j < 4; j++) grid = moveAndRotate(grid) as string[][];
      if (
        i >= detected.startIndex && i < detected.startIndex + detected.length
      ) detected.values.push(score(grid));
      //console.log(i, score(grid));
    }
    return detected
      .values[
        (TARGETCYCLES - detected.startIndex) % detected.values.length - 1
      ];
  };
  return cycle(grid, 500);
});
