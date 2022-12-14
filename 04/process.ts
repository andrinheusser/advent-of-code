const input = await Deno.readTextFile("input.txt");

const lines = input.split("\r\n").filter((l) => !!l);

const parsePairs = (line: string) =>
  line.split(",").map((a) => a.split("-").map(Number));

type Range = [number, number];

const isWithin = (value: number, range: Range) =>
  value >= range[0] && value <= range[1];
const isFullyContained = (pair: Range, range: Range) =>
  isWithin(pair[0], range) && isWithin(pair[1], range);

const part1 = () =>
  lines.reduce((acc, line) => {
    const [a, b] = parsePairs(line) as [Range, Range];
    return isFullyContained(a, b) || isFullyContained(b, a) ? acc + 1 : acc;
  }, 0);

const part2 = () =>
  lines.reduce((acc, line) => {
    const [a, b] = parsePairs(line) as [Range, Range];
    return isWithin(a[0], b as Range) ||
      isWithin(a[1], b as Range) ||
      isWithin(b[0], a as Range) ||
      isWithin(b[1], a as Range)
      ? acc + 1
      : acc;
  }, 0);

console.log(part1());
console.log(part2());
