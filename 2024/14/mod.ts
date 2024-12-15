import * as fs from "jsr:@std/fs";
import { timedSolution } from "../../utils/utils.ts";

type Coords = [number, number];
type Robot = [Coords, Coords];
const TYPE: "test" | "input" = "input";
// deno-lint-ignore ban-ts-comment
// @ts-ignore
const BOUNDS: Coords = TYPE === "test" ? [11, 7] : [101, 103];

await timedSolution(1, async () => {
  const SECONDS = 100;
  let robots = await parseInput(TYPE);

  for (let i = 0; i < SECONDS; i++) {
    robots = robots.map(step);
    if (i === SECONDS - 1) {
      return robots
        .map((r) => getQuadrant(r[0], BOUNDS))
        .reduce(
          (acc, curr) => {
            return acc.map((c, i) => c + (curr === i ? 1 : 0));
          },
          [0, 0, 0, 0]
        )
        .reduce((acc, curr) => acc * curr, 1);
    }
  }
  return 1;
});

await timedSolution(2, async () => {
  const SECONDS = 1000000;
  let robots = await parseInput(TYPE);
  let currentMax = 0;

  await fs.ensureDir("./images");

  for (let i = 0; i < SECONDS; i++) {
    robots = robots.map(step);
    const score = potential(robots);

    if (score > currentMax) {
      console.log(draw(robots));
      console.log({ step: i + 1, score, currentMax });
    }
    currentMax = Math.max(currentMax, score);
  }

  return 1;
});

function potential(robots: Robot[]) {
  const middleX = Math.floor(BOUNDS[0] / 2),
    middleY = Math.floor(BOUNDS[1] / 2);

  return robots.filter(([coords]) => {
    return (
      Math.abs(coords[0] - middleX) < 20 && Math.abs(coords[1] - middleY) < 20
    );
  }).length;
}

function draw(robots: Robot[]) {
  let output = "";
  const crop = TYPE === "test" ? 0 : 10;
  for (let y = crop; y < BOUNDS[1] - crop; y++) {
    let line = "";
    for (let x = crop; x < BOUNDS[0] - crop; x++) {
      const robotsOnSquare = robots.filter(
        (r) => r[0][0] === x && r[0][1] === y
      );
      line += robotsOnSquare.length > 0 ? robotsOnSquare.length : " ";
    }
    output += line + "\n";
  }
  return output;
}

function parseInput(fileName = "input") {
  return Deno.readTextFile(`./${fileName}.txt`).then((data) =>
    data
      .split("\n")
      .map((line) =>
        line.split(" ").map((r) => r.split("=")[1].split(",").map(Number))
      )
  ) as Promise<Robot[]>;
}

function step(robot: Robot): Robot {
  return [
    robot[0]
      .map((c, i) => c + robot[1][i])
      .map((c, i) =>
        c >= BOUNDS[i] ? c - BOUNDS[i] : c < 0 ? BOUNDS[i] + c : c
      ) as Coords,
    robot[1],
  ];
}

function getQuadrant([rx, ry]: Coords, [bx, by]: Coords): number {
  const xhalf = Math.floor(bx / 2),
    yhalf = Math.floor(by / 2),
    isMiddle = rx === xhalf || ry === yhalf;
  if (isMiddle) return -1;
  const isTop = ry < yhalf,
    isLeft = rx < xhalf;
  return isTop ? (isLeft ? 0 : 1) : isLeft ? 2 : 3;
}
