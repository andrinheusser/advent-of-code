const input = await Deno.readTextFile("input.txt");

const lines = input.split("\r\n").filter((l) => !!l);

const trees: Array<Array<number>> = [];
const treeRows: Array<Array<number>> = [];
const treeCols: Array<Array<number>> = [];

const getNeigbourArrays = (x: number, y: number) => {
  const rowLeft = treeRows[y].slice(0, x);
  const rowRight = treeRows[y].slice(x + 1);
  const colTop = treeCols[x].slice(0, y);
  const colBottom = treeCols[x].slice(y + 1);
  return {
    left: rowLeft.reverse(),
    right: rowRight,
    top: colTop.reverse(),
    bottom: colBottom,
  };
};

const countTreesInSight = (
  originHeight: number,
  treesInLine: Array<number>,
) => {
  let count = 0;
  for (let i = 0; i < treesInLine.length; i++) {
    const treeHeight = treesInLine[i];
    if (treeHeight < originHeight) {
      count++;
    } else {
      count++;
      return count;
    }
  }
  return count;
};

const scenicScore = (x: number, y: number) => {
  const { left, right, top, bottom } = getNeigbourArrays(x, y);
  const leftTrees = countTreesInSight(trees[y][x], left);
  const rightTrees = countTreesInSight(trees[y][x], right);
  const topTrees = countTreesInSight(trees[y][x], top);
  const bottomTrees = countTreesInSight(trees[y][x], bottom);
  return leftTrees * rightTrees * topTrees * bottomTrees;
};

const isMax = (x: number, y: number) => {
  const height = trees[y][x];
  const { left, right, top, bottom } = getNeigbourArrays(x, y);
  const maxLeft = Math.max(...left);
  const maxRight = Math.max(...right);
  const maxTop = Math.max(...top);
  const maxBottom = Math.max(...bottom);
  return (
    height > maxLeft ||
    height > maxRight ||
    height > maxTop ||
    height > maxBottom
  );
};

let v = 0;
let scenicScores: Array<number> = [];
for (let y = 0; y < lines.length; y++) {
  const line = lines[y];
  const treesInLine = line.split("");
  trees[y] = [];
  treeRows[y] = treesInLine.map((t) => parseInt(t));
  for (let x = 0; x < treesInLine.length; x++) {
    trees[y][x] = parseInt(treesInLine[x]);
    if (!treeCols[x]) {
      treeCols[x] = [];
    }
    treeCols[x] = [...treeCols[x], parseInt(treesInLine[x])];
  }
}
for (let y = 0; y < trees.length; y++) {
  for (let x = 0; x < trees[y].length; x++) {
    scenicScores.push(scenicScore(x, y));
    if (isMax(x, y)) {
      v++;
    }
  }
}
console.log(v);
console.log(Math.max(...scenicScores));
