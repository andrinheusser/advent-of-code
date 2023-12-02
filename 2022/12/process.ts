const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter((l) => !!l);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((l) => !!l);
*/

type Node = {
  char: string;
  visited: boolean;
  distance: number;
  height: number;
  x: number;
  y: number;
};

const MAX_STEP_UP = 1;

const getHeight = (char: string) => {
  switch (char) {
    case "S":
      return 0;
    case "E":
      return 26;
    default:
      return char.charCodeAt(0) - 97;
  }
};
type Grid = Array<Array<Node>>;

const grid: Grid = lines.map((l, y) =>
  l.split("").map((c, x) => ({
    char: c,
    visited: false,
    distance: Infinity,
    height: getHeight(c),
    x,
    y,
  }))
);
const getNodes = (grid: Grid) => grid.flat();

const getAdjecentSquares = (x: number, y: number) => [
  [x - 1, y],
  [x + 1, y],
  [x, y - 1],
  [x, y + 1],
];

const getNeighbors = (x: number, y: number, grid: Grid) => {
  const node = grid[y][x];
  return getAdjecentSquares(x, y)
    .map(([x, y]) => {
      try {
        return grid[y][x];
      } catch {
        return null;
      }
    })
    .filter((n) => !!n && n.height - node.height <= MAX_STEP_UP);
};
const getUnvisitedNeighbors = (x: number, y: number, grid: Grid) =>
  getNeighbors(x, y, grid).filter((n) => !!n && !n.visited);

const startNodes = getNodes(grid).filter((n) => {
  if (n.height > 0) return false;
  const neighbors = getNeighbors(n.x, n.y, grid);
  return !!neighbors.find((n) => n!.height > 0);
});

console.log("starting with ", startNodes.length, " start nodes");
let minDistance = Infinity;

const dijkstra = (startNode: Node, grid: Grid) => {
  const nodes = getNodes(grid);
  let current = nodes.find((n) => n.x === startNode.x && n.y === startNode.y);
  let startRun = true;
  while (!nodes.find((n) => n.visited && n.char === "E")) {
    if (!startRun) {
      current = nodes
        .filter((n) => !n.visited)
        .sort((a, b) => a.distance - b.distance)[0];
    } else {
      current!.distance = 0;
      startRun = false;
    }
    const neighbors = getUnvisitedNeighbors(current!.x, current!.y, grid);
    neighbors.forEach((n) => {
      n!.distance = Math.min(n!.distance, current!.distance + 1);
    });
    if (current!.char === "E") {
      minDistance = Math.min(minDistance, current!.distance);
    }
    current!.visited = true;
  }
  minDistance = Math.min(
    minDistance,
    nodes.find((n) => n.char === "E")!.distance
  );
};

let run = 0;

console.log(startNodes.map((n) => getNeighbors(n.x, n.y, grid)));
for (const startNode of startNodes) {
  console.log(" --- Run ", run, "/", startNodes.length, " --- ");
  console.log("starting with node ", startNode.x, startNode.y);
  dijkstra(startNode, [...grid.map((row) => [...row.map((n) => ({ ...n }))])]);
  console.log("min distance", minDistance);
  run++;
}

console.log(minDistance);
