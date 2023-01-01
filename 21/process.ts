const input = await Deno.readTextFile("input.txt");
const lines = input.split("\r\n").filter(Boolean);
/*
const input = await Deno.readTextFile("test.txt");
const lines = input.split("\n").filter((line) => !!line);
*/

type Operation = "+" | "-" | "*" | "/";

type Monkey = {
  name: string;
  value: number | null;
  left?: string;
  right?: string;
  operation?: Operation;
};

const parseLine = (line: string): Monkey => {
  const [name, job] = line.split(":").map((s) => s.trim());
  if (job.includes(" ")) {
    const [left, operation, right] = job.split(" ");
    return {
      name,
      value: null,
      left: left.trim(),
      operation: operation.trim() as Operation,
      right: right.trim(),
    };
  }
  return {
    name,
    value: parseInt(job),
  };
};

const part1 = () => {
  const monkeys: Map<string, Monkey> = new Map();

  for (const line of lines) {
    const monkey = parseLine(line);
    monkeys.set(monkey.name, monkey);
  }

  const root = monkeys.get("root")!;

  while (root.value === null) {
    for (const monkey of monkeys.values()) {
      if (monkey.value !== null) continue;
      const left = monkeys.get(monkey.left!);
      if (!left || left.value === null) continue;
      const right = monkeys.get(monkey.right!);
      if (!right || right.value === null) continue;
      switch (monkey.operation) {
        case "+":
          monkey.value = left.value + right.value;
          break;
        case "-":
          monkey.value = left.value - right.value;
          break;
        case "*":
          monkey.value = left.value * right.value;
          break;
        case "/":
          monkey.value = left.value / right.value;
          break;
      }
    }
  }
  return root.value;
};

console.time("Part I");
console.log(part1());
console.timeEnd("Part I");
