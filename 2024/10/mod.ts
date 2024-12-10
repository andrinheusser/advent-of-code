import { timedSolution } from "../../utils/utils.ts";

type C3 = [x: number, y: number, z: number];
type C2 = [x: number, y: number];

type TrailMap = Map<
  string,
  {
    height: number;
    next: string[];
  }
>;

await timedSolution(1, async () => {
  const grid = await getGrid();
  const { trailMap, trailHeads } = getTrailMap(grid);
  let score = 0;
  for (const trailHead of trailHeads) {
    const paths = findAllPaths(trailHead, trailMap);
    const ends = new Set<string>([...paths.map((p) => p[p.length - 1])]);
    score += ends.size;
  }
  return score;
});

await timedSolution(2, async () => {
  const grid = await getGrid();
  const { trailMap, trailHeads } = getTrailMap(grid);
  let score = 0;
  for (const trailHead of trailHeads) {
    const paths = findAllPaths(trailHead, trailMap);
    score += paths.length;
  }
  return score;
});

function getAdjecentSquares([x, y]: C2): [C2, C2, C2, C2] {
  return [
    [x - 1, y],
    [x + 1, y],
    [x, y - 1],
    [x, y + 1],
  ];
}

function getNeighbors([x, y, z]: C3, grid: number[][], stepUp = 1) {
  return getAdjecentSquares([x, y])
    .map(([x, y]) => {
      try {
        const height = grid[y][x];
        return { coords: [x, y, height] };
      } catch {
        return null;
      }
    })
    .filter((r) => r !== null)
    .filter(({ coords: [_x, _y, height] }) => height - z === stepUp);
}

async function getGrid(fileName = "input.txt"): Promise<number[][]> {
  const data = await Deno.readTextFile(fileName);
  return data.split("\n").map((line) =>
    line
      .split("")
      .map(Number)
      .map((n) => (isNaN(n) ? -1 : n))
  );
}

function getTrailMap(grid: number[][]) {
  const trailMap: TrailMap = new Map(),
    trailHeads: string[] = [];

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      const key = `${x},${y}`,
        height = grid[y][x];
      trailMap.set(key, {
        height: grid[y][x],
        next: getNeighbors([x, y, height], grid, 1).map(
          ({ coords }) => `${coords[0]},${coords[1]}`
        ),
      });
      if (height === 0) {
        trailHeads.push(key);
      }
    }
  }
  return { trailMap, trailHeads };
}

function findAllPaths(start: string, trailMap: TrailMap): string[][] {
  const paths: string[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[]) {
    if (visited.has(current)) return;
    visited.add(current);
    path.push(current);

    const node = trailMap.get(current);
    if (!node) return;

    if (node.height === 9) {
      paths.push([...path]);
    } else {
      for (const neighbor of node.next) {
        dfs(neighbor, path);
      }
    }

    path.pop();
    visited.delete(current);
  }

  dfs(start, []);
  return paths;
}
