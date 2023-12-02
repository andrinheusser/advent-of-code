const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

const parseLine = (line: string) => parseInt(line, 10);

type Node = {
  value: number;
  prev?: Node;
  next?: Node;
};

const parseNodes = (
  lines: string[],
  multiplicator = 1,
): [Array<Node>, Node] => {
  const nodes: Array<Node> = lines.map(parseLine).map((value) => ({
    value: value * multiplicator,
  }))
    .map((node: Node, index, arr) => {
      node.prev = index - 1 >= 0 ? arr[index - 1] : arr[arr.length - 1];
      node.next = index + 1 < arr.length ? arr[index + 1] : arr[0];
      return node;
    });
  return [
    nodes,
    nodes.find((node) => node.value === 0)!,
  ];
};

const mix = (nodes: Array<Node>) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    const n = node.value % (nodes.length - 1);
    if (n === 0) continue;

    // "Decouple" the node from the list
    node.prev!.next = node.next;
    node.next!.prev = node.prev;

    // Find the node after which to insert the node
    let insertAfter = node.prev;
    for (let j = 0; j < Math.abs(n); j++) {
      insertAfter = n > 0 ? insertAfter!.next : insertAfter!.prev;
    }

    // Insert the node
    node.prev = insertAfter;
    node.next = insertAfter!.next;

    // Say hi to the neighbors
    node.prev!.next = node;
    node.next!.prev = node;
  }
  return nodes;
};

const coordinates = (zero: Node) => {
  let i = 0;
  let result = 0;
  let current = zero;
  while (i < 3001) {
    if (i % 1000 === 0 && i > 0) {
      result += current.value;
    }
    current = current.next!;
    i++;
  }
  return result;
};

const part1 = () => {
  const [nodes, zero] = parseNodes(lines);
  mix(nodes);
  return coordinates(zero);
};
const part2 = () => {
  const MULTIPLICATOR = 811589153;
  const [nodes, zero] = parseNodes(
    lines,
    MULTIPLICATOR,
  );
  for (let i = 0; i < 10; i++) mix(nodes);
  return coordinates(zero);
};

console.log("Part I: ", part1());
console.log("Part II:", part2());
