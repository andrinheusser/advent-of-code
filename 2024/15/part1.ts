import { timedSolution } from "../../utils/utils.ts";

type Map = string[][];
type Coords = [number, number];

const MOVEMENTS = [">", "<", "^", "v"];
const DIRECTIONS: Coords[] = [
  [1, 0],
  [-1, 0],
  [0, -1],
  [0, 1],
];

await timedSolution(1, async () => {
  const {
    map: initalMap,
    movements,
    robot: robotStartLocation,
  } = await parseInput();
  let robot = robotStartLocation;
  let map = initalMap;
  for (let i = 0; i < movements.length; i++) {
    const result = move(map, robot, movements[i]);
    map = result.map;
    robot = result.robot;
    //await new Promise((r) => setTimeout(r, 100));
  }
  draw(map, robot);
  return score(map);
});

function score(map: Map) {
  return map.reduce<number>((acc, line, y) => {
    return line.reduce<number>((accl, c, x) => {
      return c === "O" ? y * 100 + x + accl : accl;
    }, acc);
  }, 0);
}

function move(
  map: Map,
  robot: Coords,
  dir: Coords
): { map: Map; robot: Coords } {
  const next: Coords = step(robot, dir);

  if (isThereAWall(map, next)) return { map, robot };

  if (!isThereABox(map, next)) {
    return { map, robot: next };
  }

  const boxesToMove = [next];

  let next_ = step(next, dir);
  let behindBoxes: "wall" | "empty";

  while (true) {
    if (isThereAWall(map, next_)) {
      behindBoxes = "wall";
      break;
    }
    if (!isThereABox(map, next_)) {
      behindBoxes = "empty";
      break;
    }
    boxesToMove.push(next_);
    next_ = step(next_, dir);
  }

  if (behindBoxes === "wall") {
    return { map, robot };
  }

  boxesToMove.toReversed().forEach((box) => {
    const nextLocation = step(box, dir);
    map[nextLocation[1]][nextLocation[0]] = "O";
    map[box[1]][box[0]] = ".";
  });

  return { map, robot: next };
}

function step([x, y]: Coords, [dx, dy]: Coords): Coords {
  return [x + dx, y + dy];
}

function isThereAWall(map: Map, [x, y]: Coords) {
  return map[y][x] === "#";
}

function isThereABox(map: Map, [x, y]: Coords) {
  return map[y][x] === "O";
}

function draw(map: Map, robot: Coords) {
  console.log(
    map
      .map((line, y) =>
        line
          .map((c, x) => (x === robot[0] && y === robot[1] ? "@" : c))
          .join("")
      )
      .join("\n")
  );
}

async function parseInput(
  input = "input"
): Promise<{ map: Map; movements: Coords[]; robot: Coords }> {
  const [map, movements] = await Deno.readTextFile(`./${input}.txt`).then(
    (data) => data.split("\n\n")
  );
  return {
    map: map
      .split("\n")
      .map((line) => line.split("").map((c) => (c === "@" ? "." : c))),
    movements: movements
      .split("")
      .filter((c) => MOVEMENTS.includes(c))
      .map((m) => DIRECTIONS[MOVEMENTS.indexOf(m)]),
    robot: map.split("\n").reduce<Coords>(
      (acc, line, y) => {
        if (acc[0] !== 0) return acc;
        let robot = acc;
        line.split("").forEach((char, x) => {
          if (char === "@") {
            robot = [x, y];
          }
        });
        return robot;
      },
      [0, 0]
    ),
  };
}
