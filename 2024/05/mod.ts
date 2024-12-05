import { lines, timedSolution } from "../../utils/utils.ts";

type NodeMap = Map<number, number[]>;
type Update = number[];

await timedSolution(1, async () => {
  const nodes: NodeMap = new Map();
  const updates: Update[] = [];

  let sum = 0;

  for await (const line of lines("input.txt")) {
    if (line.includes("|")) {
      const [child, parent] = line.split("|").map(Number);
      const node = nodes.get(child);
      if (node) {
        nodes.set(child, [...node, parent]);
      } else {
        nodes.set(child, [parent]);
      }
    } else if (line.includes(",")) {
      updates.push(line.split(",").map(Number));
      const update = line.split(",").map(Number);
      const sorted = sort(nodeSubset(update, nodes));

      sum += update.every((n, i) => n === sorted[i])
        ? sorted[Math.floor(sorted.length / 2)]
        : 0;
    }
  }
  return sum;
});
await timedSolution(2, async () => {
  const nodes: NodeMap = new Map();
  const updates: Update[] = [];

  let sum = 0;

  for await (const line of lines("input.txt")) {
    if (line.includes("|")) {
      const [child, parent] = line.split("|").map(Number);
      const node = nodes.get(child);
      if (node) {
        nodes.set(child, [...node, parent]);
      } else {
        nodes.set(child, [parent]);
      }
    } else if (line.includes(",")) {
      updates.push(line.split(",").map(Number));
      const update = line.split(",").map(Number);
      const sorted = sort(nodeSubset(update, nodes));

      sum += update.some((n, i) => n !== sorted[i])
        ? sorted[Math.floor(sorted.length / 2)]
        : 0;
    }
  }
  return sum;
});

function nodeSubset(numbers: number[], nodes: NodeMap) {
  const result: Map<number, number[]> = new Map();
  for (const number of numbers) {
    result.set(number, nodes.get(number) ?? []);
  }
  return result;
}

function sort(nodes: NodeMap): number[] {
  const updates = nodes.keys().toArray(),
    inDegree: Map<number, number> = new Map(),
    queue: number[] = [],
    result: number[] = [];

  for (const [node, parents] of nodes) {
    if (!inDegree.has(node)) {
      inDegree.set(node, 0);
    }
    for (const parent of parents) {
      inDegree.set(parent, (inDegree.get(parent) || 0) + 1);
    }
  }

  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }

  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    for (const parent of nodes.get(node) || []) {
      inDegree.set(parent, inDegree.get(parent)! - 1);
      if (inDegree.get(parent) === 0) {
        queue.push(parent);
      }
    }
  }

  return result.filter((node) => updates.includes(node));
}
