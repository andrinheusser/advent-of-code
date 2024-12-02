import { loadFile, splitLines, timedSolution } from "../../utils/utils.ts";

const nodeValue = (nodeString: string) =>
  Number(
    nodeString.split("").reduce((sumStr, char) => {
      return sumStr + char.charCodeAt(0);
    }, ""),
  );

const gcd = (a: number, b: number): number => a ? gcd(b % a, a) : b;
const lcm = (a: number, b: number): number => a * b / gcd(a, b);

await timedSolution(1, async () => {
  const nodeMap: Map<number, [number, number]> = new Map();
  let instructions: number[] = [];
  await loadFile(true).then(splitLines).then((lines) => {
    instructions = lines[0].split("").map((c) => c === "L" ? 0 : 1);
    lines.slice(2).forEach((line) => {
      const [name, navigation] = line.split(" = ");
      const [left, right] = navigation.substring(1, navigation.length - 1)
        .split(", ");
      nodeMap.set(nodeValue(name), [nodeValue(left), nodeValue(right)]);
    });
  });
  let i = 0;
  let current = nodeValue("AAA");
  const target = nodeValue("ZZZ");
  do {
    const instruction = instructions[i % instructions.length];
    current = nodeMap.get(current)![instruction];
    i++;
  } while (current !== target);
  return i;
});

await timedSolution(2, async () => {
  const isTargetNode = (node: number) => node % 100 === 90;
  const nodeMap: Map<number, [number, number]> = new Map();
  let instructions: number[] = [];
  let currentNodes: { foundAt: number; node: number }[] = [];
  const targetNodes: number[] = [];
  await loadFile(true).then(splitLines).then((lines) => {
    instructions = lines[0].split("").map((c) => c === "L" ? 0 : 1);
    lines.slice(2).forEach((line) => {
      const [name, navigation] = line.split(" = ");
      const [left, right] = navigation.substring(1, navigation.length - 1)
        .split(", ");
      if (name.endsWith("A")) {
        currentNodes.push({ node: nodeValue(name), foundAt: -1 });
      }
      if (name.endsWith("Z")) targetNodes.push(nodeValue(name));
      nodeMap.set(nodeValue(name), [nodeValue(left), nodeValue(right)]);
    });
  });
  let i = 0;
  do {
    const instruction = instructions[i % instructions.length];
    currentNodes = currentNodes.map((node) => {
      if (node.foundAt > 0) return node;
      node.node = nodeMap.get(node.node)![instruction];
      if (isTargetNode(node.node)) {
        node.foundAt = i;
      }
      return node;
    });
    i++;
  } while (!currentNodes.every((node) => node.foundAt > -1));
  return currentNodes.map((node) => (node.foundAt + 1) / (instructions.length))
    .reduce(
      lcm,
    ) * instructions.length;
});
