const input = await Deno.readTextFile("input.txt");

const instructions = input.split("\r\n").filter((l) => !!l);

const parseInstruction = (instruction: string) => {
  const [_, count, from, to] =
    instruction.match(/move (\d+) from (\d+) to (\d+)/) ?? [];
  return {
    count: parseInt(count),
    from: parseInt(from),
    to: parseInt(to),
  };
};

class Stack {
  constructor(private crates: string[]) {}
  take(count: number) {
    return this.crates.splice(this.crates.length - count, count);
  }
  peek() {
    return this.crates[this.crates.length - 1];
  }
  add(crates: string[]) {
    this.crates.push(...crates);
  }
  isEmpty() {
    return this.crates.length === 0;
  }
}

/***
 * Stacks
    [B]             [B] [S]
    [M]             [P] [L] [B] [J]
    [D]     [R]     [V] [D] [Q] [D]
    [T] [R] [Z]     [H] [H] [G] [C]
    [P] [W] [J] [B] [J] [F] [J] [S]
[N] [S] [Z] [V] [M] [N] [Z] [F] [M]
[W] [Z] [H] [D] [H] [G] [Q] [S] [W]
[B] [L] [Q] [W] [S] [L] [J] [W] [Z]
 1   2   3   4   5   6   7   8   9
 */

const stacks = [
  new Stack(["B", "W", "N"]),
  new Stack(["L", "Z", "S", "P", "T", "D", "M", "B"]),
  new Stack(["Q", "H", "Z", "W", "R"]),
  new Stack(["W", "D", "V", "J", "Z", "R"]),
  new Stack(["S", "H", "M", "B"]),
  new Stack(["L", "G", "N", "J", "H", "V", "P", "B"]),
  new Stack(["J", "Q", "Z", "F", "H", "D", "L", "S"]),
  new Stack(["W", "S", "F", "J", "G", "Q", "B"]),
  new Stack(["Z", "W", "M", "S", "C", "D", "J"]),
];

for (let i = 0; i < instructions.length; i++) {
  const { count, from, to } = parseInstruction(instructions[i]);
  const fromStack = stacks[from - 1];
  const toStack = stacks[to - 1];
  const crates = fromStack.take(count);
  toStack.add(crates);
}

const topCrates = stacks.map((s) => s.peek()).join("");
console.log(topCrates);
